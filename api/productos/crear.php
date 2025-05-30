<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Conectar a la base de datos
$conexion = new mysqli('localhost', 'root', '', 'vendeya');

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
    exit();
}

// Verificar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido.']);
    exit();
}

// TODO: Implementar autenticación/autorización aquí para verificar que el usuario logeado es un vendedor.
// Por ahora, asumimos que el vendedor_id se pasa en la solicitud (lo cual NO es seguro para producción).
// Una mejor práctica sería obtener el vendedor_id de la sesión del usuario autenticado en el backend.
$vendedor_id = 1; // HARDCODED temporalmente para pruebas con el admin

// Recibir datos del formulario (FormData)
$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$precio = $_POST['precio'] ?? '';
$categoria_id = $_POST['categoria_id'] ?? '';
$stock = $_POST['stock'] ?? '';
$imagen_path = null; // Ruta de la imagen en el servidor

// Manejar la subida de la imagen
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $directorio_imagenes = '../../public/imagenes/productos/'; // Directorio donde se guardarán las imágenes (ajustar ruta)

    // Crear el directorio si no existe
    if (!is_dir($directorio_imagenes)) {
        mkdir($directorio_imagenes, 0777, true);
    }

    $nombre_archivo = uniqid() . '_' . basename($_FILES['imagen']['name']);
    $ruta_destino = $directorio_imagenes . $nombre_archivo;

    // Mover el archivo subido
    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta_destino)) {
        $imagen_path = 'imagenes/productos/' . $nombre_archivo; // Ruta relativa para guardar en BD (ajustar si es necesario)
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al subir la imagen.']);
        $conexion->close();
        exit();
    }
}

// Validar datos (validación básica, se puede mejorar)
if (empty($nombre) || empty($descripcion) || empty($precio) || empty($categoria_id) || $stock === '') {
    // Si la imagen es opcional, ajusta la validación
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['error' => 'Faltan campos requeridos.']);
    $conexion->close();
    exit();
}

// Validar formato de precio y stock
if (!is_numeric($precio) || $precio <= 0) {
     http_response_code(400);
     echo json_encode(['error' => 'Formato de precio inválido.']);
     $conexion->close();
     exit();
}

if (!is_numeric($stock) || $stock < 0 || floor($stock) != $stock) {
     http_response_code(400);
     echo json_encode(['error' => 'Formato de stock inválido.']);
     $conexion->close();
     exit();
}


// Preparar la consulta SQL para insertar el producto
$sql = "INSERT INTO productos (nombre, descripcion, precio, vendedor_id, categoria_id, imagen, stock) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);

// Bind parámetros
$stmt->bind_param('ssdiii', $nombre, $descripcion, $precio, $vendedor_id, $categoria_id, $imagen_path, $stock);
// s: string, d: double (para precio), i: integer (para vendedor_id, categoria_id, stock), b: blob (si guardáramos la imagen directamente en BD)
// Nota: el tipo para imagen_path es 's' (string) ya que guardamos la ruta, no el contenido binario.
// Ajuste: hay 7 parámetros, el último (stock) es 'i'. Debemos usar 'ssdiisi'.
$stmt->bind_param('ssdiisi', $nombre, $descripcion, $precio, $vendedor_id, $categoria_id, $imagen_path, $stock);


// Ejecutar la consulta
if ($stmt->execute()) {
    // Producto creado con éxito
    $nuevo_producto_id = $conexion->insert_id;
    http_response_code(201); // Creado
    echo json_encode(['mensaje' => 'Producto creado con éxito.', 'producto_id' => $nuevo_producto_id]);
} else {
    // Error al crear el producto
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear el producto: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
?> 