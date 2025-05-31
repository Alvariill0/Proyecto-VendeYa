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

// Consulta para obtener los items del carrito con información del producto
$sql = "SELECT ci.id, ci.producto_id, ci.cantidad, p.nombre, p.descripcion, p.precio, p.imagen, u.nombre as vendedor_nombre 
        FROM carrito_items ci 
        JOIN productos p ON ci.producto_id = p.id 
        JOIN usuarios u ON p.vendedor_id = u.id 
        WHERE ci.usuario_id = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $usuario_id);
$stmt->execute();
$resultado = $stmt->get_result();

$items = [];
$total_precio = 0;

while ($fila = $resultado->fetch_assoc()) {
    // Calcular el subtotal para este item
    $subtotal = $fila['precio'] * $fila['cantidad'];
    $total_precio += $subtotal;
    
    // Añadir el item al array de items
    $items[] = [
        'id' => $fila['id'],
        'producto_id' => $fila['producto_id'],
        'nombre' => $fila['nombre'],
        'descripcion' => $fila['descripcion'],
        'precio' => $fila['precio'],
        'imagen' => $fila['imagen'],
        'vendedor_nombre' => $fila['vendedor_nombre'],
        'cantidad' => $fila['cantidad'],
        'subtotal' => $subtotal
    ];
}

// Devolver los items del carrito y el total
echo json_encode([
    'items' => $items,
    'total_items' => count($items),
    'total_precio' => $total_precio
]);