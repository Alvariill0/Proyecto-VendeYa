<?php
/**
 * API para cambiar la contraseña de un usuario
 * 
 * Este script permite a un usuario cambiar su contraseña,
 * verificando primero la contraseña actual.
 * 
 * @package VendeYa
 * @subpackage API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Permitir solicitudes OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar que sea una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Obtener datos del cuerpo de la solicitud
$datos = json_decode(file_get_contents('php://input'), true);

// Validar datos recibidos
if (!isset($datos['userId']) || !isset($datos['passwordActual']) || !isset($datos['passwordNueva'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// Verificar que el usuario solo pueda cambiar su propia contraseña
if (intval($datos['userId']) !== $usuario['id']) {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'No tienes permiso para cambiar esta contraseña']);
    exit;
}

// Validar longitud mínima de la nueva contraseña
if (strlen($datos['passwordNueva']) < 6) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'La nueva contraseña debe tener al menos 6 caracteres']);
    exit;
}

// Conectar a la base de datos
$conexion = obtenerConexion();

// Verificar la contraseña actual
$stmt = $conexion->prepare('SELECT password FROM usuarios WHERE id = ?');
$stmt->bind_param('i', $usuario['id']);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    http_response_code(404); // Not Found
    echo json_encode(['error' => 'Usuario no encontrado']);
    exit;
}

$usuarioDB = $resultado->fetch_assoc();

// Verificar que la contraseña actual sea correcta
if (!password_verify($datos['passwordActual'], $usuarioDB['password'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['error' => 'Contraseña actual incorrecta']);
    exit;
}

// Hashear la nueva contraseña
$passwordHash = password_hash($datos['passwordNueva'], PASSWORD_DEFAULT);

// Actualizar la contraseña
$stmt = $conexion->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
$stmt->bind_param('si', $passwordHash, $usuario['id']);

if ($stmt->execute()) {
    echo json_encode(['mensaje' => 'Contraseña actualizada correctamente']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Error al actualizar la contraseña: ' . $conexion->error]);
}

$stmt->close();
$conexion->close();