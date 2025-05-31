import { useState, useEffect } from 'react';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { 
    obtenerValoracionesProducto, 
    crearValoracion, 
    actualizarValoracion, 
    eliminarValoracion, 
    verificarValoracionUsuario 
} from '../services/servicioValoraciones';
import { toast } from 'react-toastify';

/**
 * Hook personalizado para gestionar las valoraciones de productos
 * @param {number} productoId - ID del producto
 * @returns {Object} Funciones y estado para gestionar valoraciones
 */
export function useValoraciones(productoId) {
    const { usuario } = useAutenticacion();
    const [valoraciones, setValoraciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({ total: 0, promedio: 0 });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [puedeValorar, setPuedeValorar] = useState(false);
    const [valoracionUsuario, setValoracionUsuario] = useState(null);

    // Cargar valoraciones
    const cargarValoraciones = async () => {
        if (!productoId) return;
        
        setCargando(true);
        setError(null);
        
        try {
            const respuesta = await obtenerValoracionesProducto(productoId);
            setValoraciones(respuesta.valoraciones || []);
            setEstadisticas(respuesta.estadisticas || { total: 0, promedio: 0 });
            
            // Si hay un usuario autenticado, verificar si puede valorar
            if (usuario?.id) {
                const verificacion = await verificarValoracionUsuario(productoId);
                setPuedeValorar(verificacion.puede_valorar);
                if (verificacion.ha_valorado) {
                    setValoracionUsuario(verificacion.valoracion);
                }
            }
        } catch (err) {
            console.error('Error al cargar valoraciones:', err);
            setError('No se pudieron cargar las valoraciones');
        } finally {
            setCargando(false);
        }
    };

    // Efecto para cargar valoraciones al montar el componente o cambiar el productoId o usuario
    useEffect(() => {
        cargarValoraciones();
    }, [productoId, usuario]);

    // Crear una nueva valoración
    const crear = async (datos) => {
        if (!productoId || !usuario) {
            toast.error('Debes iniciar sesión para valorar');
            return null;
        }
        
        if (!datos.puntuacion) {
            toast.error('Debes seleccionar una puntuación');
            return null;
        }
        
        try {
            const valoracionCompleta = {
                producto_id: productoId,
                puntuacion: datos.puntuacion,
                comentario: datos.comentario || ''
            };
            
            const respuesta = await crearValoracion(valoracionCompleta);
            
            // Actualizar estado local
            setValoraciones(prev => [respuesta.valoracion, ...prev]);
            setValoracionUsuario(respuesta.valoracion);
            setPuedeValorar(false);
            
            // Recalcular estadísticas
            actualizarEstadisticas([respuesta.valoracion, ...valoraciones]);
            
            toast.success('Valoración enviada correctamente');
            return respuesta.valoracion;
        } catch (err) {
            console.error('Error al crear valoración:', err);
            toast.error(err.message || 'Error al enviar la valoración');
            return null;
        }
    };

    // Actualizar una valoración existente
    const actualizar = async (datos) => {
        if (!valoracionUsuario || !usuario) {
            toast.error('No se puede actualizar la valoración');
            return null;
        }
        
        try {
            const valoracionActualizada = {
                id: valoracionUsuario.id,
                puntuacion: datos.puntuacion,
                comentario: datos.comentario
            };
            
            const respuesta = await actualizarValoracion(valoracionActualizada);
            
            // Actualizar estado local
            setValoraciones(prev => 
                prev.map(v => v.id === valoracionUsuario.id ? respuesta.valoracion : v)
            );
            setValoracionUsuario(respuesta.valoracion);
            
            // Recalcular estadísticas
            actualizarEstadisticas(
                valoraciones.map(v => v.id === valoracionUsuario.id ? respuesta.valoracion : v)
            );
            
            toast.success('Valoración actualizada correctamente');
            return respuesta.valoracion;
        } catch (err) {
            console.error('Error al actualizar valoración:', err);
            toast.error(err.message || 'Error al actualizar la valoración');
            return null;
        }
    };

    // Eliminar una valoración
    const eliminar = async () => {
        if (!valoracionUsuario || !usuario) {
            toast.error('No se puede eliminar la valoración');
            return false;
        }
        
        try {
            await eliminarValoracion(valoracionUsuario.id);
            
            // Actualizar estado local
            const nuevasValoraciones = valoraciones.filter(v => v.id !== valoracionUsuario.id);
            setValoraciones(nuevasValoraciones);
            setValoracionUsuario(null);
            setPuedeValorar(true);
            
            // Recalcular estadísticas
            actualizarEstadisticas(nuevasValoraciones);
            
            toast.success('Valoración eliminada correctamente');
            return true;
        } catch (err) {
            console.error('Error al eliminar valoración:', err);
            toast.error('Error al eliminar la valoración');
            return false;
        }
    };

    // Función auxiliar para actualizar estadísticas
    const actualizarEstadisticas = (listaValoraciones) => {
        const total = listaValoraciones.length;
        const promedio = total > 0 
            ? listaValoraciones.reduce((sum, v) => sum + v.puntuacion, 0) / total 
            : 0;
            
        setEstadisticas({
            total,
            promedio: Math.round(promedio * 10) / 10
        });
    };

    return {
        valoraciones,
        estadisticas,
        cargando,
        error,
        puedeValorar,
        valoracionUsuario,
        cargarValoraciones,
        crear,
        actualizar,
        eliminar
    };
}