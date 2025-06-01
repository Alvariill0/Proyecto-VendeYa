<?php
/**
 * API para actualizar el perfil de un usuario
 * 
 * Este script permite a un usuario actualizar su información de perfil
 * como nombre y correo electrónico.
 * 
 * @package VendeYa
 * @subpackage API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Permitir solicitudes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar que sea una solicitud PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Incluir archivos necesarios
require_once '../config/database.php';
require_once '../utils/auth.php';

// Verificar autenticación
$usuario = verificarAutenticacion();
if (!$usuario) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// Obtener el ID del usuario a actualizar
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Verificar que el usuario solo pueda actualizar su propio perfil
if ($id !== $usuario['id']) {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'No tienes permiso para actualizar este perfil']);
    exit;
}

// Obtener datos del cuerpo de la solicitud
$datos = json_decode(file_get_contents('php://input'), true);

// Validar datos recibidos
if (!isset($datos['nombre']) || !isset($datos['email'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// Validar email
if (!filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// Conectar a la base de datos
$conexion = obtenerConexion();

// Verificar si el email ya está en uso por otro usuario
$stmt = $conexion->prepare('SELECT id FROM usuarios WHERE email = ? AND id != ?');
$stmt->bind_param('si', $datos['email'], $id);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['error' => 'El email ya está en uso por otro usuario']);
    exit;
}

// Actualizar datos del usuario
$stmt = $conexion->prepare('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?');
$stmt->bind_param('ssi', $datos['nombre'], $datos['email'], $id);

if ($stmt->execute()) {
    // Obtener los datos actualizados del usuario
    $stmt = $conexion->prepare('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $usuarioActualizado = $resultado->fetch_assoc();
    
    echo json_encode($usuarioActualizado);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al actualizar el perfil: ' . $conexion->error]);
}

$stmt->close();
$conexion->close();