<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Verificar que hay items en el carrito
$sql_verificar_carrito = "SELECT COUNT(*) as total FROM carrito_items WHERE usuario_id = ?";
$stmt_verificar_carrito = $conexion->prepare($sql_verificar_carrito);
$stmt_verificar_carrito->bind_param('i', $usuario_id);
$stmt_verificar_carrito->execute();
$resultado_verificar_carrito = $stmt_verificar_carrito->get_result();
$fila_verificar_carrito = $resultado_verificar_carrito->fetch_assoc();

if ($fila_verificar_carrito['total'] === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay productos en el carrito']);
    exit();
}

// Iniciar transacción
$conexion->begin_transaction();

try {
    // Obtener los items del carrito con sus precios
    $sql_items = "SELECT ci.producto_id, ci.cantidad, p.precio, p.stock 
                 FROM carrito_items ci 
                 JOIN productos p ON ci.producto_id = p.id 
                 WHERE ci.usuario_id = ?";
    $stmt_items = $conexion->prepare($sql_items);
    $stmt_items->bind_param('i', $usuario_id);
    $stmt_items->execute();
    $resultado_items = $stmt_items->get_result();
    
    $items = [];
    $total_pedido = 0;
    
    // Verificar stock y calcular total
    while ($item = $resultado_items->fetch_assoc()) {
        // Verificar stock suficiente
        if ($item['stock'] < $item['cantidad']) {
            throw new Exception("No hay suficiente stock para el producto ID: {$item['producto_id']}");
        }
        
        $subtotal = $item['precio'] * $item['cantidad'];
        $total_pedido += $subtotal;
        
        $items[] = [
            'producto_id' => $item['producto_id'],
            'cantidad' => $item['cantidad'],
            'precio_unitario' => $item['precio']
        ];
    }
    
    // Crear el pedido
    $sql_pedido = "INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, 'pendiente')";
    $stmt_pedido = $conexion->prepare($sql_pedido);
    $stmt_pedido->bind_param('id', $usuario_id, $total_pedido);
    $stmt_pedido->execute();
    
    $pedido_id = $conexion->insert_id;
    
    // Insertar los items del pedido
    $sql_insertar_item = "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
    $stmt_insertar_item = $conexion->prepare($sql_insertar_item);
    
    foreach ($items as $item) {
        $stmt_insertar_item->bind_param('iiid', $pedido_id, $item['producto_id'], $item['cantidad'], $item['precio_unitario']);
        $stmt_insertar_item->execute();
        
        // Actualizar el stock del producto
        $sql_actualizar_stock = "UPDATE productos SET stock = stock - ? WHERE id = ?";
        $stmt_actualizar_stock = $conexion->prepare($sql_actualizar_stock);
        $stmt_actualizar_stock->bind_param('ii', $item['cantidad'], $item['producto_id']);
        $stmt_actualizar_stock->execute();
        $stmt_actualizar_stock->close();
    }
    
    // Vaciar el carrito del usuario
    $sql_vaciar_carrito = "DELETE FROM carrito_items WHERE usuario_id = ?";
    $stmt_vaciar_carrito = $conexion->prepare($sql_vaciar_carrito);
    $stmt_vaciar_carrito->bind_param('i', $usuario_id);
    $stmt_vaciar_carrito->execute();
    
    // Confirmar la transacción
    $conexion->commit();
    
    // Devolver respuesta exitosa
    echo json_encode([
        'success' => true,
        'mensaje' => 'Pedido creado con éxito',
        'pedido_id' => $pedido_id
    ]);
    
} catch (Exception $e) {
    // Revertir la transacción en caso de error
    $conexion->rollback();
    
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    // Cerrar todas las conexiones
    if (isset($stmt_items)) $stmt_items->close();
    if (isset($stmt_pedido)) $stmt_pedido->close();
    if (isset($stmt_insertar_item)) $stmt_insertar_item->close();
    if (isset($stmt_vaciar_carrito)) $stmt_vaciar_carrito->close();
    $conexion->close();
}
?>