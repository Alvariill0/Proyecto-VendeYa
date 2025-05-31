import React from 'react';

/**
 * Componente para mostrar el estado de un pedido con el color correspondiente
 * @param {Object} props - Propiedades del componente
 * @param {string} props.estado - Estado del pedido (completado, pendiente, cancelado, etc.)
 * @param {string} props.className - Clases adicionales para el badge
 * @returns {JSX.Element} Badge con el estado del pedido
 */
function EstadoPedido({ estado, className = '' }) {
    // Determinar el color del badge según el estado
    const getBadgeClass = () => {
        switch (estado.toLowerCase()) {
            case 'completado':
                return 'bg-success';
            case 'pendiente':
                return 'bg-warning';
            case 'cancelado':
                return 'bg-danger';
            case 'procesando':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <span className={`badge ${getBadgeClass()} ${className}`}>
            {estado.toUpperCase()}
        </span>
    );
}

export default EstadoPedido;