<?php
/**
 * Configuración de la base de datos
 * 
 * Este archivo contiene la configuración de conexión a la base de datos
 * y proporciona una función para obtener la conexión.
 */

/**
 * Obtiene una conexión a la base de datos
 * 
 * @return mysqli Objeto de conexión a la base de datos
 */
function obtenerConexion() {
    $host = 'localhost';
    $usuario = 'root';
    $password = '';
    $base_datos = 'vendeya';
    
    $conexion = new mysqli($host, $usuario, $password, $base_datos);
    
    // Verificar conexión
    if ($conexion->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error]);
        exit();
    }
    
    // Establecer charset
    $conexion->set_charset('utf8');
    
    return $conexion;
}