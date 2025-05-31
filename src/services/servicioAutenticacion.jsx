/**
 * Servicio para gestionar la autenticación de usuarios
 * @module servicioAutenticacion
 */

import { post } from './servicioBase';

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario autenticado
 */
export async function login(email, password) {
    return post('/auth/login.php', { email, password });
}

/**
 * Registra un nuevo usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Datos del usuario registrado
 */
export async function registro(nombre, email, password) {
    return post('/auth/registro.php', { nombre, email, password });
}

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function logout() {
    return post('/auth/logout.php');
}

export default {
    login,
    registro,
    logout
};