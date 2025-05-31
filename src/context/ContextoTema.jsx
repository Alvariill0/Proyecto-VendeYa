import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const ContextoTema = createContext();

// Hook personalizado para usar el contexto
export const useTheme = () => useContext(ContextoTema);

// Proveedor del contexto
export const ProveedorTema = ({ children }) => {
    // Verificar si hay una preferencia guardada en localStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // Efecto para aplicar el tema al cargar y cuando cambie
    useEffect(() => {
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        // Aplicar clases CSS al elemento html o body
        if (isDarkMode) {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            document.body.classList.add('bg-dark');
            document.body.classList.add('text-light');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            document.body.classList.remove('bg-dark');
            document.body.classList.remove('text-light');
        }
    }, [isDarkMode]);

    // Función para cambiar entre temas
    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // Valores proporcionados por el contexto
    const value = {
        isDarkMode,
        toggleTheme
    };

    return (
        <ContextoTema.Provider value={value}>
            {children}
        </ContextoTema.Provider>
    );
};