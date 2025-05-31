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

// Obtener el ID del producto a eliminar
$datos = json_decode(file_get_contents('php://input'), true);

// Si se envía por POST
if (isset($_POST['producto_id'])) {
    $producto_id = intval($_POST['producto_id']);
} 
// Si se envía por DELETE con JSON
elseif (isset($datos['producto_id'])) {
    $producto_id = intval($datos['producto_id']);
} 
// Si se envía por DELETE con parámetro en la URL
elseif (isset($_GET['id'])) {
    $producto_id = intval($_GET['id']);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de producto válido']);
    $conexion->close();
    exit();
}

// Verificar que el producto existe y pertenece al vendedor
$sql_verificar = "SELECT * FROM productos WHERE id = ?";
$stmt_verificar = $conexion->prepare($sql_verificar);
$stmt_verificar->bind_param('i', $producto_id);
$stmt_verificar->execute();
$resultado_verificar = $stmt_verificar->get_result();

if ($resultado_verificar->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
    $conexion->close();
    exit();
}

$producto = $resultado_verificar->fetch_assoc();

// En una aplicación real, verificaríamos que el usuario autenticado es el propietario del producto
// o un administrador antes de permitir la eliminación
// Por ahora, simplemente verificamos que se proporcione un vendedor_id
$vendedor_id = isset($datos['vendedor_id']) ? intval($datos['vendedor_id']) : 
    (isset($_POST['vendedor_id']) ? intval($_POST['vendedor_id']) : null);

if ($vendedor_id !== null && $vendedor_id !== $producto['vendedor_id']) {
    // Verificar si el usuario es administrador (rol = 'admin')
    $es_admin = false; // Aquí iría la lógica para verificar si es admin
    
    if (!$es_admin) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permiso para eliminar este producto']);
        $conexion->close();
        exit();
    }
}

// Eliminar el producto
$sql = "DELETE FROM productos WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param('i', $producto_id);

if ($stmt->execute()) {
    // Si el producto tenía una imagen, podríamos eliminarla del servidor aquí
    if (!empty($producto['imagen']) && !filter_var($producto['imagen'], FILTER_VALIDATE_URL)) {
        $ruta_imagen = '../../uploads/productos/' . $producto['imagen'];
        if (file_exists($ruta_imagen)) {
            unlink($ruta_imagen);
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'mensaje' => 'Producto eliminado correctamente',
        'producto_id' => $producto_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al eliminar el producto: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();