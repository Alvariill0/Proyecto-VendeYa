<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

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

// Obtener todos los pedidos del usuario
$sql_pedidos = "SELECT id, fecha_pedido, estado, total FROM pedidos WHERE usuario_id = ? ORDER BY fecha_pedido DESC";
$stmt_pedidos = $conexion->prepare($sql_pedidos);
$stmt_pedidos->bind_param('i', $usuario_id);
$stmt_pedidos->execute();
$resultado_pedidos = $stmt_pedidos->get_result();

$pedidos = [];

while ($pedido = $resultado_pedidos->fetch_assoc()) {
    // Para cada pedido, obtener sus items con detalles del producto
    $sql_items = "SELECT pi.*, p.nombre, p.imagen 
                 FROM pedido_items pi 
                 JOIN productos p ON pi.producto_id = p.id 
                 WHERE pi.pedido_id = ?";
    
    $stmt_items = $conexion->prepare($sql_items);
    $stmt_items->bind_param('i', $pedido['id']);
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