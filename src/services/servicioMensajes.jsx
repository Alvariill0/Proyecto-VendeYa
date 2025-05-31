/**
 * Servicio para gestionar mensajes entre usuarios
 * @module servicioMensajes
 */

import { get, post, put } from './servicioBase';

/**
 * Obtiene la lista de conversaciones del usuario actual
 * @returns {Promise<Array>} Lista de conversaciones
 */
export async function listarConversaciones() {
    return get('/mensajes/listar_conversaciones.php');
}

/**
 * Obtiene los mensajes de una conversación específica
 * @param {number} conversacionId - ID de la conversación
 * @returns {Promise<Array>} Lista de mensajes
 */
export async function obtenerMensajesConversacion(conversacionId) {
    if (!conversacionId) {
        throw new Error('Se requiere un ID de conversación válido');
    }
    return get(`/mensajes/obtener_mensajes.php?conversacion_id=${conversacionId}`);
}

/**
 * Inicia una nueva conversación con otro usuario
 * @param {number} receptorId - ID del usuario receptor
 * @param {string} mensaje - Contenido del primer mensaje
 * @returns {Promise<Object>} Información de la conversación creada
 */
export async function iniciarConversacion(receptorId, mensaje) {
    if (!receptorId) {
        throw new Error('Se requiere un ID de receptor válido');
    }
    if (!mensaje || mensaje.trim() === '') {
        throw new Error('El mensaje no puede estar vacío');
    }
    return post('/mensajes/iniciar_conversacion.php', { receptor_id: receptorId, mensaje });
}

/**
 * Envía un mensaje en una conversación existente
 * @param {number} conversacionId - ID de la conversación
 * @param {number} receptorId - ID del usuario receptor
 * @param {string} mensaje - Contenido del mensaje
 * @returns {Promise<Object>} Información del mensaje enviado
 */
export async function enviarMensaje(conversacionId, receptorId, mensaje) {
    if (!conversacionId) {
        throw new Error('Se requiere un ID de conversación válido');
    }
    if (!receptorId) {
        throw new Error('Se requiere un ID de receptor válido');
    }
    if (!mensaje || mensaje.trim() === '') {
        throw new Error('El mensaje no puede estar vacío');
    }
    return post('/mensajes/enviar_mensaje.php', { 
        conversacion_id: conversacionId, 
        receptor_id: receptorId, 
        mensaje 
    });
}

/**
 * Marca como leídos los mensajes de una conversación
 * @param {number} conversacionId - ID de la conversación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function marcarComoLeidos(conversacionId) {
    if (!conversacionId) {
        throw new Error('Se requiere un ID de conversación válido');
    }
    return put('/mensajes/marcar_leidos.php', { conversacion_id: conversacionId });
}

/**
 * Obtiene el número de mensajes no leídos del usuario actual
 * @returns {Promise<Object>} Número de mensajes no leídos
 */
export async function obtenerMensajesNoLeidos() {
    return get('/mensajes/no_leidos.php');
}

/**
 * Busca usuarios para iniciar una conversación
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Lista de usuarios que coinciden con el término
 */
export async function buscarUsuarios(termino) {
    if (!termino || termino.trim() === '') {
        throw new Error('Se requiere un término de búsqueda válido');
    }
    return get(`/mensajes/buscar_usuarios.php?termino=${encodeURIComponent(termino)}`);
}

export default {
    listarConversaciones,
    obtenerMensajesConversacion,
    iniciarConversacion,
    enviarMensaje,
    marcarComoLeidos,
    obtenerMensajesNoLeidos,
    buscarUsuarios
};