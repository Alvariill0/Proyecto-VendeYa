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
// Verificar que se hayan enviado los datos requeridoss
if (!isset($datos['nombre']) || !isset($datos['email']) || !isset($datos['password'])) {
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

// Verificar si el email ya existe
$stmt = $conexion->prepare('SELECT id FROM usuarios WHERE email = ?');
$stmt->bind_param('s', $datos['email']);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'El email ya está registrado']);
    exit();
}

// Hashear la contraseña antes de guardarla
$password_hash = password_hash($datos['password'], PASSWORD_DEFAULT);

// Insertar el nuevo usuario
$stmt = $conexion->prepare('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, "usuario")');
$stmt->bind_param('sss', $datos['nombre'], $datos['email'], $password_hash);

if ($stmt->execute()) {
    echo json_encode([
        'mensaje' => 'Usuario registrado exitosamente',
        'usuario' => [
            'id' => $conexion->insert_id,
            'nombre' => $datos['nombre'],
            'email' => $datos['email'],
            'rol' => 'usuario'
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al registrar el usuario']);
}

$stmt->close();
$conexion->close(); 