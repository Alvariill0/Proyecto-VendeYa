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

// Eliminar todos los items del carrito del usuario
$sql_vaciar = "DELETE FROM carrito_items WHERE usuario_id = ?";
$stmt_vaciar = $conexion->prepare($sql_vaciar);
$stmt_vaciar->bind_param('i', $usuario_id);

if ($stmt_vaciar->execute()) {
    $items_eliminados = $conexion->affected_rows;
    echo json_encode([
        'mensaje' => 'Carrito vaciado correctamente',
        'items_eliminados' => $items_eliminados
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al vaciar el carrito']);
}