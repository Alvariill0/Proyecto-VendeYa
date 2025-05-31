<?php
/**
 * Funciones de autenticación para la API
 * 
 * Este archivo contiene funciones relacionadas con la autenticación
 * de usuarios en la API.
 */

/**
 * Verifica si el usuario está autenticado
 * 
 * @return array|false Datos del usuario si está autenticado, false en caso contrario
 */
function verificarAutenticacion() {
    // Iniciar sesión si no está iniciada
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Verificar si el usuario está autenticado
    if (!isset($_SESSION['usuario_id'])) {
        return false;
    }
    
    // Devolver datos del usuario
    return [
        'id' => $_SESSION['usuario_id'],
        'rol' => $_SESSION['rol'] ?? 'cliente' // Valor por defecto si no existe
    ];
}