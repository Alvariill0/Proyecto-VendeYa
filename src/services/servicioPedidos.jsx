/**
 * Servicio para gestionar pedidos
 * @module servicioPedidos
 */

import { get, post } from './servicioBase';

/**
 * Obtiene la lista de pedidos del usuario actual
 * @returns {Promise<Array>} Lista de pedidos
 */
export async function listarPedidos() {
    return get('/pedidos/listar.php');
}

/**
 * Obtiene la lista de pedidos que contienen productos vendidos por el usuario actual
 * @returns {Promise<Array>} Lista de pedidos con productos del vendedor
 */
export async function listarPedidosVendedor() {
    return get('/pedidos/listar_vendedor.php');
}

/**
 * Crea un nuevo pedido con los productos del carrito
 * @returns {Promise<Object>} Información del pedido creado
 */
export async function crearPedido() {
    return post('/pedidos/crear.php');
}

/**
 * Obtiene los detalles de un pedido específico
 * @param {number} pedidoId - ID del pedido
 * @returns {Promise<Object>} Detalles del pedido
 */
export async function obtenerPedido(pedidoId) {
    if (!pedidoId) {
        throw new Error('Se requiere un ID de pedido válido');
    }
    return get(`/pedidos/obtener.php?id=${pedidoId}`);
}

/**
 * Actualiza el estado de un pedido
 * @param {number} pedidoId - ID del pedido
 * @param {string} estado - Nuevo estado del pedido
 * @returns {Promise<Object>} Resultado de la actualización
 */
export async function actualizarEstadoPedido(pedidoId, estado) {
    if (!pedidoId) {
        throw new Error('Se requiere un ID de pedido válido');
    }
    if (!estado) {
        throw new Error('Se requiere un estado válido');
    }
    return post('/pedidos/actualizar.php', { id: pedidoId, estado });
}

export default {
    listarPedidos,
    listarPedidosVendedor,
    crearPedido,
    obtenerPedido,
    actualizarEstadoPedido
};