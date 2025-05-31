<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

$vendedor_id = $usuario['id'];

// Crear conexión a la base de datos
$conexion = obtenerConexion();

// Verificar conexión
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Obtener todos los pedidos que contienen productos del vendedor
$sql_pedidos = "SELECT DISTINCT p.id, p.fecha_pedido, p.estado, p.total, p.usuario_id, u.nombre as comprador_nombre
    FROM pedidos p
    JOIN pedido_items pi ON p.id = pi.pedido_id
    JOIN productos pr ON pi.producto_id = pr.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE pr.vendedor_id = ?
    ORDER BY p.fecha_pedido DESC";

$stmt_pedidos = $conexion->prepare($sql_pedidos);
$stmt_pedidos->bind_param('i', $vendedor_id);
$stmt_pedidos->execute();
$resultado_pedidos = $stmt_pedidos->get_result();

$pedidos = [];

while ($pedido = $resultado_pedidos->fetch_assoc()) {
    // Para cada pedido, obtener solo los items que pertenecen al vendedor
    $sql_items = "SELECT pi.*, p.nombre, p.imagen, p.vendedor_id 
        FROM pedido_items pi 
        JOIN productos p ON pi.producto_id = p.id 
        WHERE pi.pedido_id = ? AND p.vendedor_id = ?";
    
    $stmt_items = $conexion->prepare($sql_items);
    $stmt_items->bind_param('ii', $pedido['id'], $vendedor_id);
    $stmt_items->execute();
    $resultado_items = $stmt_items->get_result();
    
    $items = [];
    while ($item = $resultado_items->fetch_assoc()) {
        // Procesar la ruta de la imagen
        if ($item['imagen']) {
            if (strpos($item['imagen'], 'http://') === 0 || strpos($item['imagen'], 'https://') === 0) {
                // No modificar URLs externas
            } else if (substr($item['imagen'], 0, 1) !== '/') {
                $item['imagen'] = '/' . $item['imagen'];
            }
        }
        
        $items[] = $item;
    }
    
    $pedido['items'] = $items;
    $pedidos[] = $pedido;
    
    $stmt_items->close();
}

$stmt_pedidos->close();
$conexion->close();

echo json_encode($pedidos);
?>