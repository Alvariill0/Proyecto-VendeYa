/**
 * Servicio para gestionar valoraciones y comentarios de productos
 * @module servicioValoraciones
 */

import { get, post, del } from './servicioBase';

/**
 * Obtiene las valoraciones de un producto específico
 * @param {number} productoId - ID del producto
 * @returns {Promise<Array>} Lista de valoraciones del producto
 */
export async function obtenerValoracionesProducto(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }
    return get(`/valoraciones/listar.php?producto_id=${productoId}`);
}

/**
 * Crea una nueva valoración para un producto
 * @param {Object} valoracion - Datos de la valoración
 * @param {number} valoracion.producto_id - ID del producto
 * @param {number} valoracion.puntuacion - Puntuación (1-5)
 * @param {string} valoracion.comentario - Comentario opcional
 * @returns {Promise<Object>} Información de la valoración creada
 */
export async function crearValoracion(valoracion) {
    if (!valoracion || !valoracion.producto_id || !valoracion.puntuacion) {
        throw new Error('Se requieren datos válidos para la valoración');
    }
    
    // Validar que la puntuación esté entre 1 y 5
    if (valoracion.puntuacion < 1 || valoracion.puntuacion > 5) {
        throw new Error('La puntuación debe estar entre 1 y 5');
    }
    
    return post('/valoraciones/crear.php', valoracion);
}

/**
 * Actualiza una valoración existente
 * @param {Object} valoracion - Datos actualizados de la valoración
 * @param {number} valoracion.id - ID de la valoración a actualizar
 * @param {number} valoracion.puntuacion - Nueva puntuación (1-5)
 * @param {string} valoracion.comentario - Nuevo comentario
 * @returns {Promise<Object>} Resultado de la actualización
 */
export async function actualizarValoracion(valoracion) {
    if (!valoracion || !valoracion.id) {
        throw new Error('Se requiere un ID de valoración válido');
    }
    
    // Validar que la puntuación esté entre 1 y 5
    if (valoracion.puntuacion && (valoracion.puntuacion < 1 || valoracion.puntuacion > 5)) {
        throw new Error('La puntuación debe estar entre 1 y 5');
    }
    
    return post('/valoraciones/actualizar.php', valoracion);
}

/**
 * Elimina una valoración
 * @param {number} valoracionId - ID de la valoración a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function eliminarValoracion(valoracionId) {
    if (!valoracionId) {
        throw new Error('Se requiere un ID de valoración válido');
    }
    return del(`/valoraciones/eliminar.php?id=${valoracionId}`);
}

/**
 * Verifica si un usuario ya ha valorado un producto
 * @param {number} productoId - ID del producto
 * @returns {Promise<Object>} Información sobre si el usuario ha valorado el producto
 */
export async function verificarValoracionUsuario(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }
    return get(`/valoraciones/verificar.php?producto_id=${productoId}`);
}

export default {
    obtenerValoracionesProducto,
    crearValoracion,
    actualizarValoracion,
    eliminarValoracion,
    verificarValoracionUsuario
};