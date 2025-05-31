<?php
/**
 * API para buscar usuarios con los que iniciar una conversación
 */

// Incluir configuración de la base de datos y utilidades
require_once '../config/database.php';
require_once '../utils/auth.php';

// Configurar cabeceras
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Verificar si es una solicitud OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar autenticación
$usuario = verificarAutenticacion();
if (!$usuario) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

// Obtener ID del usuario actual
$usuario_id = $usuario['id'];

// Verificar si se proporcionó el término de búsqueda
if (!isset($_GET['termino']) || empty($_GET['termino'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Se requiere un término de búsqueda']);
    exit;
}

$termino = '%' . trim($_GET['termino']) . '%';

try {
    // Conectar a la base de datos
    $conn = obtenerConexion();
    
    // Consulta para buscar usuarios por nombre o email
    $query = "SELECT id, nombre, email 
        FROM usuarios 
        WHERE (nombre LIKE ? OR email LIKE ?) 
        AND id != ? 
        LIMIT 10";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ssi', $termino, $termino, $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $usuarios = [];
    while ($fila = $resultado->fetch_assoc()) {
        $usuarios[] = $fila;
    }
    
    // Devolver respuesta
    echo json_encode([
        'status' => 'success',
        'usuarios' => $usuarios
    ]);
    
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al buscar usuarios: ' . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}