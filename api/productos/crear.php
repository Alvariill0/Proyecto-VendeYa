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

session_start();
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}
$vendedor_id = $_SESSION['usuario_id'];

// Recibir datos del formulario (FormData)
$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$precio = $_POST['precio'] ?? '';
$categoria_id = $_POST['categoria_id'] ?? '';
$categoria_personalizada = $_POST['categoria_personalizada'] ?? '';
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
        // Usar una ruta accesible desde el frontend con barra inicial para asegurar que es absoluta
        $imagen_path = '/imagenes/productos/' . $nombre_archivo; // Ruta absoluta desde la raíz del servidor web
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al subir la imagen.']);
        $conexion->close();
        exit();
    }
}

// Validar datos (validación básica, se puede mejorar)
if (empty($nombre) || empty($descripcion) || empty($precio) || $stock === '') {
    // Si la imagen es opcional, ajusta la validación
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['error' => 'Faltan campos requeridos.']);
    $conexion->close();
    exit();
}

// Validar categoría
if (empty($categoria_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Debes seleccionar una categoría.']);
    $conexion->close();
    exit();
}

// Si la categoría es "otro", validar que se haya proporcionado una categoría personalizada
if ($categoria_id === 'otro' && empty($categoria_personalizada)) {
    http_response_code(400);
    echo json_encode(['error' => 'Debes especificar una categoría personalizada.']);
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
$sql = "";
$stmt = null;

// Si la categoría es "otro", usar una categoría temporal y guardar la categoría personalizada en el campo descripción
if ($categoria_id === 'otro') {
    // Buscar la categoría "Otros" o crearla si no existe
    $sqlBuscarOtros = "SELECT id FROM categorias WHERE nombre = 'Otros' LIMIT 1";
    $resultadoOtros = $conexion->query($sqlBuscarOtros);
    
    if ($resultadoOtros->num_rows > 0) {
        // Usar la categoría "Otros" existente
        $filaOtros = $resultadoOtros->fetch_assoc();
        $categoria_id = $filaOtros['id'];
    } else {
        // Crear la categoría "Otros"
        $sqlCrearOtros = "INSERT INTO categorias (nombre, descripcion) VALUES ('Otros', 'Categoría para productos pendientes de clasificación')";
        if ($conexion->query($sqlCrearOtros) === TRUE) {
            $categoria_id = $conexion->insert_id;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear la categoría Otros: ' . $conexion->error]);
            $conexion->close();
            exit();
        }
    }
    
    // Modificar la descripción para incluir la categoría personalizada
    $descripcion = "[Categoría sugerida: " . htmlspecialchars($categoria_personalizada, ENT_QUOTES, 'UTF-8') . "] " . $descripcion;
}

// Preparar la consulta SQL para insertar el producto
$sql = "INSERT INTO productos (nombre, descripcion, precio, vendedor_id, categoria_id, imagen, stock) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500); // Error del servidor
    echo json_encode(['error' => 'Error al preparar la consulta: ' . $conexion->error]);
    $conexion->close();
    exit();
}

// Bind parámetros
// s: string, d: double (para precio), i: integer (para vendedor_id, categoria_id, stock)
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