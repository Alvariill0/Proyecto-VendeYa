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

if (!isset($datos['producto_id']) || !isset($datos['cantidad'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit();
}

$producto_id = $datos['producto_id'];
$cantidad = $datos['cantidad'];

// Verificar que el producto existe
$sql_verificar = "SELECT id, stock FROM productos WHERE id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('i', $producto_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
    exit();
}

$producto = $resultado_verificar->fetch_assoc();

// Verificar si hay suficiente stock
if ($producto['stock'] <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Producto sin stock disponible']);
    exit();
} else if ($producto['stock'] < $cantidad) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay suficiente stock disponible']);
    exit();
}

// Verificar si el producto ya está en el carrito
$sql_verificar_carrito = "SELECT id, cantidad FROM carrito_items WHERE usuario_id = ? AND producto_id = ?";
$stmt_verificar_carrito = $conexion->prepare($sql_verificar_carrito);
$stmt_verificar_carrito->bind_param('ii', $usuario_id, $producto_id);
$stmt_verificar_carrito->execute();
$resultado_verificar_carrito = $stmt_verificar_carrito->get_result();

if ($resultado_verificar_carrito->num_rows > 0) {
    // El producto ya está en el carrito, actualizar la cantidad
    $item_carrito = $resultado_verificar_carrito->fetch_assoc();
    $nueva_cantidad = $item_carrito['cantidad'] + $cantidad;
    
    // Verificar si la nueva cantidad excede el stock
    if ($nueva_cantidad > $producto['stock']) {
        http_response_code(400);
        echo json_encode(['error' => 'La cantidad solicitada excede el stock disponible']);
        exit();
    }
    
    $sql_actualizar = "UPDATE carrito_items SET cantidad = ? WHERE id = ?";
    $stmt_actualizar = $conexion->prepare($sql_actualizar);
    $stmt_actualizar->bind_param('ii', $nueva_cantidad, $item_carrito['id']);
    
    if ($stmt_actualizar->execute()) {
        echo json_encode([
            'mensaje' => 'Producto actualizado en el carrito',
            'item_id' => $item_carrito['id'],
            'cantidad' => $nueva_cantidad
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al actualizar el producto en el carrito']);
    }
} else {
    // El producto no está en el carrito, añadirlo
    $sql_insertar = "INSERT INTO carrito_items (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)";
    $stmt_insertar = $conexion->prepare($sql_insertar);
    $stmt_insertar->bind_param('iii', $usuario_id, $producto_id, $cantidad);
    
    if ($stmt_insertar->execute()) {
        $item_id = $conexion->insert_id;
        echo json_encode([
            'mensaje' => 'Producto añadido al carrito',
            'item_id' => $item_id,
            'cantidad' => $cantidad
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al añadir el producto al carrito']);
    }
}