import React, { createContext, useState, useContext } from 'react'
import { login as servicioLogin, registro as servicioRegistro } from '../services/servicioAutenticacion'

// Crear el contexto
const ContextoAutenticacion = createContext()

// Proveedor del contexto
export function ProveedorAutenticacion({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)

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
    }

    const valor = {
        usuario,
        cargando,
        error,
        login,
        registro,
        logout,
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