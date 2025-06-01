import React, { createContext, useState, useContext, useEffect } from 'react'
import { 
    login as servicioLogin, 
    registro as servicioRegistro,
    actualizarPerfil as servicioActualizarPerfil,
    cambiarPassword as servicioCambiarPassword 
} from '../services/servicioAutenticacion'

// Crear el contexto
const ContextoAutenticacion = createContext()

// Proveedor del contexto
export function ProveedorAutenticacion({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem('usuario')
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null
    })
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (usuario) {
            localStorage.setItem('usuario', JSON.stringify(usuario))
        } else {
            localStorage.removeItem('usuario')
        }
    }, [usuario])

    const login = async (email, password) => {
        try {
            setCargando(true)
            setError(null)
            
            const datos = await servicioLogin(email, password)

            setUsuario(datos.usuario)
            localStorage.setItem('token', datos.token)
            return datos.usuario
        } catch (error) {
            setError(error.message)
            throw error
        } finally {
            setCargando(false)
        }
    }

    const registro = async (nombre, email, password) => {
        try {
            setCargando(true)
            setError(null)

            const datos = await servicioRegistro(nombre, email, password)

            return datos
        } catch (error) {
            setError(error.message)
            throw error
        } finally {
            setCargando(false)
        }
    }

    const logout = () => {
        setUsuario(null)
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
    }

    const actualizarPerfil = async (datosUsuario) => {
        if (!usuario) return;
        
        try {
            setCargando(true);
            setError(null);
            
            const usuarioActualizado = await servicioActualizarPerfil(usuario.id, datosUsuario);
            
            // Actualizar el estado del usuario con los nuevos datos
            setUsuario(prev => ({ ...prev, ...usuarioActualizado }));
            
            return usuarioActualizado;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setCargando(false);
        }
    };
    
    const cambiarPassword = async (passwordActual, passwordNueva) => {
        if (!usuario) return;
        
        try {
            setCargando(true);
            setError(null);
            
            const resultado = await servicioCambiarPassword(usuario.id, passwordActual, passwordNueva);
            
            return resultado;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setCargando(false);
        }
    };

    const valor = {
        usuario,
        cargando,
        error,
        login,
        registro,
        logout,
        actualizarPerfil,
        cambiarPassword
    }

    return (
        <ContextoAutenticacion.Provider value={valor}>
            {children}
        </ContextoAutenticacion.Provider>
    )
}

// Hook personalizado para usar el contexto de autenticación
export function useAutenticacion() {
    const contexto = useContext(ContextoAutenticacion)
    if (!contexto) {
        throw new Error('useAutenticacion debe ser usado dentro de un ProveedorAutenticacion')
    }
    return contexto
}