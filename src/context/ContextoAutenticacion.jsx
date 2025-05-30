import React, { createContext, useState, useContext } from 'react'

// Crear el contexto
const ContextoAutenticacion = createContext(null)

// Proveedor del contexto
export const ProveedorAutenticacion = ({ children }) => {
    const [estaAutenticado, setEstaAutenticado] = useState(false)
    const [usuario, setUsuario] = useState(null) // Aquí podrías guardar los datos del usuario
    const [rol, setRol] = useState(null) // Aquí guardaríamos el rol (cliente, vendedor, admin)

    // Funciones para manejar la autenticación
    const iniciarSesion = (datosUsuario, userRol) => {
        // Aquí iría la lógica real para iniciar sesión (llamar al backend, guardar token, etc.)
        setEstaAutenticado(true)
        setUsuario(datosUsuario)
        setRol(userRol)
        console.log('Usuario ha iniciado sesión')
    }

    const cerrarSesion = () => {
        // Aquí iría la lógica real para cerrar sesión (eliminar token, limpiar estado, etc.)
        setEstaAutenticado(false)
        setUsuario(null)
        setRol(null)
        console.log('Usuario ha cerrado sesión')
    }

    return (
        <ContextoAutenticacion.Provider value={{
        estaAutenticado,
        usuario,
        rol,
        iniciarSesion,
        cerrarSesion,
        }}>
        {children}
        </ContextoAutenticacion.Provider>
    )
    }

// Hook personalizado para usar el contexto de autenticación
export const useAutenticacion = () => {
    const context = useContext(ContextoAutenticacion)
    if (context === undefined) {
        throw new Error('useAutenticacion debe usarse dentro de un ProveedorAutenticacion')
    }
    return context
} 