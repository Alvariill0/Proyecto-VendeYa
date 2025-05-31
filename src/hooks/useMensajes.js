import { useState, useEffect, useCallback } from 'react';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import {
    listarConversaciones,
    obtenerMensajesConversacion,
    iniciarConversacion,
    enviarMensaje,
    marcarComoLeidos,
    obtenerMensajesNoLeidos,
    buscarUsuarios
} from '../services/servicioMensajes';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gestionar mensajes entre usuarios
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.cargarAlInicio - Si es true, carga las conversaciones al montar el componente
 * @returns {Object} Estado y funciones para gestionar mensajes
 */
export function useMensajes(options = {}) {
    const { cargarAlInicio = true } = options;
    const { usuario } = useAutenticacion();
    
    const [conversaciones, setConversaciones] = useState([]);
    const [mensajesActuales, setMensajesActuales] = useState([]);
    const [conversacionActual, setConversacionActual] = useState(null);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);
    const [error, setError] = useState(null);
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [buscando, setBuscando] = useState(false);

    // Cargar conversaciones
    const cargarConversaciones = useCallback(async () => {
        if (!usuario) return;
        
        setCargando(true);
        setError(null);
        
        try {
            const respuesta = await listarConversaciones();
            setConversaciones(respuesta.conversaciones || []);
        } catch (error) {
            console.error('Error al cargar conversaciones:', error);
            setError('No se pudieron cargar las conversaciones. ' + error.message);
            toast.error('Error al cargar conversaciones: ' + error.message);
        } finally {
            setCargando(false);
        }
    }, [usuario]);

    // Cargar mensajes de una conversación
    const cargarMensajesConversacion = useCallback(async (conversacionId, usuarioInfo) => {
        if (!conversacionId) return;
        
        setCargandoMensajes(true);
        setError(null);
        
        try {
            const respuesta = await obtenerMensajesConversacion(conversacionId);
            setMensajesActuales(respuesta.mensajes || []);
            setConversacionActual(conversacionId);
            setUsuarioActual(usuarioInfo);
            
            // Marcar mensajes como leídos
            await marcarComoLeidos(conversacionId);
            
            // Actualizar contador de mensajes no leídos
            actualizarContadorNoLeidos();
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            setError('No se pudieron cargar los mensajes. ' + error.message);
            toast.error('Error al cargar mensajes: ' + error.message);
        } finally {
            setCargandoMensajes(false);
        }
    }, []);

    // Enviar un mensaje
    const enviarNuevoMensaje = useCallback(async (mensaje) => {
        if (!conversacionActual || !usuarioActual || !mensaje) return;
        
        setError(null);
        
        try {
            // Optimistic update - añadir mensaje a la lista antes de la respuesta del servidor
            const mensajeOptimista = {
                id: 'temp-' + Date.now(),
                emisor_id: usuario.id,
                receptor_id: usuarioActual.id,
                contenido: mensaje,
                fecha: new Date().toISOString(),
                leido: false,
                temporal: true // Marca para identificar mensajes optimistas
            };
            
            setMensajesActuales(prev => [...prev, mensajeOptimista]);
            
            // Enviar mensaje al servidor
            const respuesta = await enviarMensaje(conversacionActual, usuarioActual.id, mensaje);
            
            // Actualizar mensaje optimista con datos reales
            setMensajesActuales(prev => prev.map(m => 
                m.id === mensajeOptimista.id ? respuesta.mensaje : m
            ));
            
            // Actualizar lista de conversaciones
            cargarConversaciones();
            
            return respuesta.mensaje;
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            setError('No se pudo enviar el mensaje. ' + error.message);
            toast.error('Error al enviar mensaje: ' + error.message);
            
            // Eliminar mensaje optimista en caso de error
            setMensajesActuales(prev => prev.filter(m => !m.temporal));
            
            throw error;
        }
    }, [conversacionActual, usuarioActual, usuario, cargarConversaciones]);

    // Iniciar una nueva conversación
    const iniciarNuevaConversacion = useCallback(async (receptorId, mensaje) => {
        if (!receptorId || !mensaje) return;
        
        setError(null);
        
        try {
            const respuesta = await iniciarConversacion(receptorId, mensaje);
            
            // Actualizar lista de conversaciones
            await cargarConversaciones();
            
            // Cargar mensajes de la nueva conversación
            await cargarMensajesConversacion(respuesta.conversacion.id, respuesta.usuario);
            
            return respuesta;
        } catch (error) {
            console.error('Error al iniciar conversación:', error);
            setError('No se pudo iniciar la conversación. ' + error.message);
            toast.error('Error al iniciar conversación: ' + error.message);
            throw error;
        }
    }, [cargarConversaciones, cargarMensajesConversacion]);

    // Actualizar contador de mensajes no leídos
    const actualizarContadorNoLeidos = useCallback(async () => {
        if (!usuario) return;
        
        try {
            const respuesta = await obtenerMensajesNoLeidos();
            setMensajesNoLeidos(respuesta.no_leidos || 0);
        } catch (error) {
            console.error('Error al obtener mensajes no leídos:', error);
        }
    }, [usuario]);

    // Buscar usuarios para iniciar conversación
    const buscarUsuariosParaConversacion = useCallback(async (termino) => {
        if (!termino || termino.trim() === '') {
            setResultadosBusqueda([]);
            return;
        }
        
        setBuscando(true);
        setError(null);
        
        try {
            const respuesta = await buscarUsuarios(termino);
            setResultadosBusqueda(respuesta.usuarios || []);
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            setError('No se pudieron buscar usuarios. ' + error.message);
        } finally {
            setBuscando(false);
        }
    }, []);

    // Formatear fecha para mostrar
    const formatearFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        // Si es hoy, mostrar solo la hora
        if (fecha.toDateString() === hoy.toDateString()) {
            return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Si es ayer, mostrar "Ayer" y la hora
        if (fecha.toDateString() === ayer.toDateString()) {
            return `Ayer ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Si es este año, mostrar día, mes y hora
        if (fecha.getFullYear() === hoy.getFullYear()) {
            return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + 
                   ' ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Si es otro año, mostrar fecha completa
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + 
               ' ' + fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    // Cargar conversaciones al montar el componente
    useEffect(() => {
        if (cargarAlInicio && usuario) {
            cargarConversaciones();
            actualizarContadorNoLeidos();
        }
    }, [cargarAlInicio, usuario, cargarConversaciones, actualizarContadorNoLeidos]);

    return {
        conversaciones,
        mensajesActuales,
        conversacionActual,
        usuarioActual,
        mensajesNoLeidos,
        cargando,
        cargandoMensajes,
        error,
        resultadosBusqueda,
        buscando,
        cargarConversaciones,
        cargarMensajesConversacion,
        enviarNuevoMensaje,
        iniciarNuevaConversacion,
        actualizarContadorNoLeidos,
        buscarUsuariosParaConversacion,
        formatearFecha
    };
}

export default useMensajes;