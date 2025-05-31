<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitimos peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Obtener los datos del cuerpo de la petición
$datos = json_decode(file_get_contents('php://input'), true);

if (!isset($datos['email']) || !isset($datos['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit();
}

// Conectar a la base de datos
$conexion = new mysqli('localhost', 'root', '', 'vendeya');

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit();
}

// Preparar la consulta para obtener el usuario por email
$stmt = $conexion->prepare('SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?');
$stmt->bind_param('s', $datos['email']);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    exit();
}

$usuario = $resultado->fetch_assoc();

// Verificar la contraseña hasheada
session_start();
if (!password_verify($datos['password'], $usuario['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciales inválidas']);
    exit();
}

// Si llegamos aquí, las credenciales son correctas
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['rol'] = $usuario['rol'];

// Generar token 
$token = bin2hex(random_bytes(32));

// Devolver respuesta exitosa
echo json_encode([
    'mensaje' => 'Login exitoso',
    'token' => $token,
    'usuario' => [
        'id' => $usuario['id'],
        'nombre' => $usuario['nombre'],
        'email' => $usuario['email'],
        'rol' => $usuario['rol']
    ]
]);

$stmt->close();
$conexion->close();