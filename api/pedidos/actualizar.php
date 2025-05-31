<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar si la solicitud es POST o PUT
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido.']);
    exit();
}

// Incluir archivos de configuración y conexión
require_once '../config/database.php';
require_once '../utils/auth.php';

// Verificar si el usuario está autenticado
$usuario = verificarAutenticacion();
if (!$usuario) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit();
}

$usuario_id = $usuario['id'];
$es_admin = $usuario['rol'] === 'admin';

// Obtener datos del cuerpo de la petición
$datos = json_decode(file_get_contents('php://input'), true);

// Verificar datos requeridos
if (!isset($datos['id']) || empty($datos['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de pedido']);
    exit();
}

if (!isset($datos['estado']) || empty($datos['estado'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un estado para el pedido']);
    exit();
}

$pedido_id = intval($datos['id']);
$nuevo_estado = $datos['estado'];

// Validar que el estado sea válido
$estados_validos = ['pendiente', 'procesando', 'completado', 'cancelado'];
if (!in_array($nuevo_estado, $estados_validos)) {
    http_response_code(400);
    echo json_encode(['error' => 'Estado no válido. Los estados permitidos son: ' . implode(', ', $estados_validos)]);
    exit();
}

// Crear conexión a la base de datos
$conexion = obtenerConexion();

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Verificar que el pedido existe
$sql_verificar = "SELECT usuario_id FROM pedidos WHERE id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('i', $pedido_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Pedido no encontrado']);
    exit();
}

$pedido = $resultado_verificar->fetch_assoc();

// Verificar si el usuario es vendedor de algún producto en este pedido
$es_vendedor_del_pedido = false;
if (!$es_admin && $pedido['usuario_id'] !== $usuario_id) {
    $sql_verificar_vendedor = "SELECT COUNT(*) as es_vendedor 
        FROM pedido_items pi 
        JOIN productos p ON pi.producto_id = p.id 
        WHERE pi.pedido_id = ? AND p.vendedor_id = ?";
    $stmt_verificar_vendedor = $conexion->prepare($sql_verificar_vendedor);
    $stmt_verificar_vendedor->bind_param('ii', $pedido_id, $usuario_id);
    $stmt_verificar_vendedor->execute();
    $resultado_verificar_vendedor = $stmt_verificar_vendedor->get_result();
    $fila_verificar_vendedor = $resultado_verificar_vendedor->fetch_assoc();
    
    $es_vendedor_del_pedido = $fila_verificar_vendedor['es_vendedor'] > 0;
    $stmt_verificar_vendedor->close();
}

// Verificar que el usuario es el propietario del pedido, es admin o es vendedor de algún producto en el pedido
if ($pedido['usuario_id'] !== $usuario_id && !$es_admin && !$es_vendedor_del_pedido) {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permiso para actualizar este pedido']);
    exit();
}

// Actualizar el estado del pedido
$sql_actualizar = "UPDATE pedidos SET estado = ? WHERE id = ?";
$stmt_actualizar = $conexion->prepare($sql_actualizar);
$stmt_actualizar->bind_param('si', $nuevo_estado, $pedido_id);

if ($stmt_actualizar->execute()) {
    // Devolver respuesta exitosa
    echo json_encode([
        'success' => true,
        'mensaje' => 'Estado del pedido actualizado con éxito',
        'pedido_id' => $pedido_id,
        'nuevo_estado' => $nuevo_estado
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar el estado del pedido: ' . $conexion->error]);
}

// Cerrar conexiones
$stmt_verificar->close();
$stmt_actualizar->close();
$conexion->close();
?>