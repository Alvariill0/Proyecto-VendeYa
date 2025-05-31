<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar si la solicitud es DELETE o POST (para compatibilidad)
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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

if (!isset($datos['item_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el ID del item']);
    exit();
}

$item_id = $datos['item_id'];

// Verificar que el item pertenece al usuario
$sql_verificar = "SELECT id FROM carrito_items WHERE id = ? AND usuario_id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('ii', $item_id, $usuario_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Item no encontrado en el carrito']);
    exit();
}

// Eliminar el item del carrito
$sql_eliminar = "DELETE FROM carrito_items WHERE id = ?";
$stmt_eliminar = $conexion->prepare($sql_eliminar);
$stmt_eliminar->bind_param('i', $item_id);

if ($stmt_eliminar->execute()) {
    echo json_encode([
        'mensaje' => 'Item eliminado del carrito correctamente',
        'item_id' => $item_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar el item del carrito']);
}