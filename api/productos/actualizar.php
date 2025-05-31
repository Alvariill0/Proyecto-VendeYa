<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Si es una petición OPTIONS, terminamos aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar si la solicitud es PUT o POST (para compatibilidad)
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Obtener los datos del producto a actualizar
$datos = json_decode(file_get_contents('php://input'), true);

// Si se envía un formulario multipart/form-data (para actualizar imagen)
if (isset($_POST['producto_id'])) {
    $datos = $_POST;
}

// Verificar que se proporcionó un ID de producto
if (!isset($datos['producto_id']) || empty($datos['producto_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un ID de producto válido']);
    $conexion->close();
    exit();
}

$producto_id = intval($datos['producto_id']);

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
// o un administrador antes de permitir la actualización
// Por ahora, simplemente verificamos que se proporcione un vendedor_id
$vendedor_id = isset($datos['vendedor_id']) ? intval($datos['vendedor_id']) : null;

if ($vendedor_id !== null && $vendedor_id !== $producto['vendedor_id']) {
    // Verificar si el usuario es administrador (rol = 'admin')
    $es_admin = false; // Aquí iría la lógica para verificar si es admin
    
    if (!$es_admin) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes permiso para actualizar este producto']);
        $conexion->close();
        exit();
    }
}

// Preparar los campos a actualizar
$campos = [];
$tipos = '';
$valores = [];

// Nombre
if (isset($datos['nombre']) && !empty($datos['nombre'])) {
    $campos[] = "nombre = ?";
    $tipos .= 's';
    $valores[] = $datos['nombre'];
}

// Descripción
if (isset($datos['descripcion'])) {
    $campos[] = "descripcion = ?";
    $tipos .= 's';
    $valores[] = $datos['descripcion'];
}

// Precio
if (isset($datos['precio']) && is_numeric($datos['precio']) && $datos['precio'] >= 0) {
    $campos[] = "precio = ?";
    $tipos .= 'd';
    $valores[] = floatval($datos['precio']);
}

// Categoría
if (isset($datos['categoria_id']) && !empty($datos['categoria_id'])) {
    $campos[] = "categoria_id = ?";
    $tipos .= 'i';
    $valores[] = intval($datos['categoria_id']);
}

// Stock
if (isset($datos['stock']) && is_numeric($datos['stock']) && $datos['stock'] >= 0) {
    $campos[] = "stock = ?";
    $tipos .= 'i';
    $valores[] = intval($datos['stock']);
}

// Imagen (si se ha subido una nueva)
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $imagen_temporal = $_FILES['imagen']['tmp_name'];
    $nombre_imagen = $_FILES['imagen']['name'];
    $extension = pathinfo($nombre_imagen, PATHINFO_EXTENSION);
    $nombre_archivo = uniqid() . '.' . $extension;
    $ruta_destino = '../../uploads/productos/' . $nombre_archivo;
    
    // Crear directorio si no existe
    if (!file_exists('../../uploads/productos/')) {
        mkdir('../../uploads/productos/', 0777, true);
    }
    
    if (move_uploaded_file($imagen_temporal, $ruta_destino)) {
        $campos[] = "imagen = ?";
        $tipos .= 's';
        $valores[] = $nombre_archivo; // Guardamos solo el nombre del archivo en la BD
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al subir la imagen']);
        $conexion->close();
        exit();
    }
}

// Si no hay campos para actualizar, devolver error
if (empty($campos)) {
    http_response_code(400);
    echo json_encode(['error' => 'No se proporcionaron datos para actualizar']);
    $conexion->close();
    exit();
}

// Construir la consulta SQL
$sql = "UPDATE productos SET " . implode(", ", $campos) . " WHERE id = ?";
$tipos .= 'i'; // Tipo para el ID del producto
$valores[] = $producto_id; // Añadir el ID del producto al final

// Preparar y ejecutar la consulta
$stmt = $conexion->prepare($sql);

// Bind de parámetros dinámicos
$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    // Obtener el producto actualizado
    $sql_obtener = "SELECT p.*, u.nombre as vendedor_nombre, c.nombre as categoria_nombre 
                   FROM productos p 
                   JOIN usuarios u ON p.vendedor_id = u.id 
                   LEFT JOIN categorias c ON p.categoria_id = c.id 
                   WHERE p.id = ?";
    $stmt_obtener = $conexion->prepare($sql_obtener);
    $stmt_obtener->bind_param('i', $producto_id);
    $stmt_obtener->execute();
    $resultado_obtener = $stmt_obtener->get_result();
    $producto_actualizado = $resultado_obtener->fetch_assoc();
    
    // Ajustar la URL de la imagen para que sea accesible desde el frontend
    if ($producto_actualizado['imagen']) {
        // Verificar si la imagen ya tiene una URL completa
        if (!filter_var($producto_actualizado['imagen'], FILTER_VALIDATE_URL)) {
            $producto_actualizado['imagen'] = "uploads/productos/" . $producto_actualizado['imagen'];
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'mensaje' => 'Producto actualizado correctamente',
        'producto' => $producto_actualizado
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar el producto: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();