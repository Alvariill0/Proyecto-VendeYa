<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar si la solicitud es PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido.']);
    exit();
}

// Conectar a la base de datos
$conexion = new mysqli('localhost', 'root', '', 'vendeya');

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Iniciar sesión para obtener el ID del usuario
session_start();
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

$usuario_id = $_SESSION['usuario_id'];

// Obtener datos del cuerpo de la petición
$datos = json_decode(file_get_contents('php://input'), true);

if (!isset($datos['item_id']) || !isset($datos['cantidad'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit();
}

$item_id = $datos['item_id'];
$cantidad = $datos['cantidad'];

// Verificar que la cantidad sea válida
if ($cantidad <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'La cantidad debe ser mayor que cero']);
    exit();
}

// Verificar que el item pertenece al usuario
$sql_verificar = "SELECT ci.id, ci.producto_id, p.stock 
    FROM carrito_items ci 
    JOIN productos p ON ci.producto_id = p.id 
    WHERE ci.id = ? AND ci.usuario_id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('ii', $item_id, $usuario_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();
// si el item no existe o no pertenece al usuario
if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Item no encontrado en el carrito']);
    exit();
}

$item = $resultado_verificar->fetch_assoc();

// Verificar si hay suficiente stock
if ($item['stock'] < $cantidad) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay suficiente stock disponible']);
    exit();
}

// Actualizar la cantidad
$sql_actualizar = "UPDATE carrito_items SET cantidad = ? WHERE id = ?";
$stmt_actualizar = $conexion->prepare($sql_actualizar);
$stmt_actualizar->bind_param('ii', $cantidad, $item_id);

if ($stmt_actualizar->execute()) {
    echo json_encode([
        'mensaje' => 'Cantidad actualizada correctamente',
        'item_id' => $item_id,
        'cantidad' => $cantidad
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar la cantidad']);
}