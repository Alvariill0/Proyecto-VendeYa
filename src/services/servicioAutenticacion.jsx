/**
 * Servicio para gestionar la autenticación de usuarios
 * @module servicioAutenticacion
 */

import { post, put } from './servicioBase';

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

/**
 * Actualiza la información del perfil del usuario
 * @param {number} userId - ID del usuario
 * @param {Object} datosUsuario - Datos actualizados del usuario
 * @returns {Promise<Object>} Datos actualizados del usuario
 */
export async function actualizarPerfil(userId, datosUsuario) {
    return put(`/auth/actualizar_perfil.php?id=${userId}`, datosUsuario);
}

/**
 * Cambia la contraseña del usuario
 * @param {number} userId - ID del usuario
 * @param {string} passwordActual - Contraseña actual
 * @param {string} passwordNueva - Nueva contraseña
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function cambiarPassword(userId, passwordActual, passwordNueva) {
    return post('/auth/cambiar_password.php', { 
        userId, 
        passwordActual, 
        passwordNueva 
    });
}

export default {
    login,
    registro,
    logout,
    actualizarPerfil,
    cambiarPassword
};