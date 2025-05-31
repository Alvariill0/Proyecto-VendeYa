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

// Obtener el ID del producto de la URL
$producto_id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (!$producto_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de producto válido']);
    exit();
}

// Consulta para obtener los detalles completos del producto
$sql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, p.stock, 
               p.created_at, p.updated_at, p.categoria_id,
               u.id as vendedor_id, u.nombre as vendedor_nombre,
               c.nombre as categoria_nombre
        FROM productos p 
        JOIN usuarios u ON p.vendedor_id = u.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $producto_id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
    exit();
}

$producto = $resultado->fetch_assoc();

// Asegurarse de que la ruta de la imagen sea accesible desde el frontend
if ($producto['imagen']) {
    // Si es una URL externa (http o https), mantenerla igual
    if (strpos($producto['imagen'], 'http://') === 0 || strpos($producto['imagen'], 'https://') === 0) {
        // No modificar URLs externas
    } 
    // Si no tiene barra inicial, añadirla para que sea una ruta absoluta
    else if (substr($producto['imagen'], 0, 1) !== '/') {
        $producto['imagen'] = '/' . $producto['imagen'];
    }
}

// Devolver el producto en formato JSON
echo json_encode($producto);

$stmt->close();
$conexion->close();
?>