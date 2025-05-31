/**
 * Servicio para gestionar el carrito de compras
 * @module servicioCarrito
 */

import { get, post, put, del } from './servicioBase';

/**
 * Obtiene los items del carrito del usuario actual
 * @returns {Promise<Object>} Datos del carrito con items y totales
 */
export async function obtenerCarrito() {
    return get('/carrito/listar.php');
}

/**
 * Añade un producto al carrito
 * @param {number} productoId - ID del producto a añadir
 * @param {number} cantidad - Cantidad del producto (por defecto 1)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function agregarAlCarrito(productoId, cantidad = 1) {
    return post('/carrito/agregar.php', { producto_id: productoId, cantidad });
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {number} itemId - ID del item del carrito
 * @param {number} cantidad - Nueva cantidad
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function actualizarCantidadCarrito(itemId, cantidad) {
    if (cantidad <= 0) {
        return eliminarDelCarrito(itemId);
    }
    return put('/carrito/actualizar.php', { item_id: itemId, cantidad });
}

/**
 * Elimina un producto del carrito
 * @param {number} itemId - ID del item del carrito a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function eliminarDelCarrito(itemId) {
    return del('/carrito/eliminar.php', {
        body: JSON.stringify({ item_id: itemId })
    });
}

/**
 * Vacía completamente el carrito
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function vaciarCarrito() {
    return del('/carrito/vaciar.php');
}

export default {
    obtenerCarrito,
    agregarAlCarrito,
    actualizarCantidadCarrito,
    eliminarDelCarrito,
    vaciarCarrito
};