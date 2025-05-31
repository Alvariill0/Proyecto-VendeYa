import React from 'react';

/**
 * Componente para mostrar estados de carga, error o contenido vacío
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.cargando - Si es true, muestra el spinner de carga
 * @param {string|null} props.error - Mensaje de error a mostrar
 * @param {boolean} props.vacio - Si es true, muestra el mensaje de contenido vacío
 * @param {string} props.mensajeVacio - Mensaje a mostrar cuando no hay contenido
 * @param {string} props.className - Clases adicionales para el contenedor
 * @param {React.ReactNode} props.children - Contenido a mostrar cuando no hay estados especiales
 * @returns {JSX.Element} Componente con el estado correspondiente
 */
function EstadoCarga({ 
    cargando = false, 
    error = null, 
    vacio = false, 
    mensajeVacio = 'No hay elementos para mostrar.', 
    className = 'my-3',
    children 
}) {
    if (cargando) {
        return (
            <div className={`d-flex justify-content-center ${className}`}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`alert alert-danger ${className}`} role="alert">
                {error}
            </div>
        );
    }

    if (vacio) {
        return (
            <div className={`alert alert-info ${className}`} role="alert">
                {mensajeVacio}
            </div>
        );
    }

    return children;
}

export default EstadoCarga;