<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar solicitudes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar que la solicitud sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Conectar a la base de datos
$conexion = new mysqli('localhost', 'root', '', 'vendeya');

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Obtener datos del cuerpo de la solicitud
$datos = json_decode(file_get_contents('php://input'), true);

// Verificar que se proporcionaron los datos necesarios
if (!isset($datos['nombre']) || empty($datos['nombre'])) {
    http_response_code(400);
    echo json_encode(['error' => 'El nombre de la categoría es obligatorio']);
    $conexion->close();
    exit();
}

// Sanitizar los datos de entrada
$nombre = htmlspecialchars($datos['nombre'], ENT_QUOTES, 'UTF-8');
$descripcion = isset($datos['descripcion']) ? htmlspecialchars($datos['descripcion'], ENT_QUOTES, 'UTF-8') : '';
$parent_id = isset($datos['parent_id']) && is_numeric($datos['parent_id']) ? (int)$datos['parent_id'] : null;

// Verificar si la categoría ya existe
$sql_verificar = "SELECT id FROM categorias WHERE nombre = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param("s", $nombre);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Ya existe una categoría con ese nombre']);
    $stmt_verificar->close();
    $conexion->close();
    exit();
}
$stmt_verificar->close();

// Si se proporciona un parent_id, verificar que exista para crear subcategorías
if ($parent_id !== null) {
    $sql_verificar_padre = "SELECT id FROM categorias WHERE id = ?";
    $stmt_verificar_padre = $conexion->prepare($sql_verificar_padre);
    $stmt_verificar_padre->bind_param("i", $parent_id);
    $stmt_verificar_padre->execute();
    $resultado_verificar_padre = $stmt_verificar_padre->get_result();
    
    if ($resultado_verificar_padre->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'La categoría padre no existe']);
        $stmt_verificar_padre->close();
        $conexion->close();
        exit();
    }
    $stmt_verificar_padre->close();
}

// Preparar la consulta SQL para insertar la categoría
if ($parent_id === null) {
    $sql = "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $nombre, $descripcion);
} else { // Si es una subcategoría
    $sql = "INSERT INTO categorias (nombre, descripcion, parent_id) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssi", $nombre, $descripcion, $parent_id);
}

// Ejecutar la consulta
if ($stmt->execute()) {
    $categoria_id = $stmt->insert_id;
    http_response_code(201); // Created
    echo json_encode([
        'mensaje' => 'Categoría creada correctamente',
        'categoria' => [
            'id' => $categoria_id,
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'parent_id' => $parent_id
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear la categoría: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>