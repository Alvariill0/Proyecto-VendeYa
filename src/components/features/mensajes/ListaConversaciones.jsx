import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { useTheme } from '../../../context/ContextoTema';

/**
 * Componente que muestra la lista de conversaciones del usuario
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.conversaciones - Lista de conversaciones
 * @param {Object} props.conversacionActual - Conversación actualmente seleccionada
 * @param {Function} props.onSeleccionarConversacion - Función para manejar la selección de una conversación
 * @param {Function} props.formatearFecha - Función para formatear fechas
 * @returns {JSX.Element} Componente de lista de conversaciones
 */
function ListaConversaciones({ conversaciones, conversacionActual, onSeleccionarConversacion, formatearFecha }) {
    const { isDarkMode } = useTheme();
    
    return (
        <ListGroup variant="flush">
            {conversaciones.map(conversacion => (
                <ListGroup.Item 
                    key={conversacion.id}
                    action 
                    active={conversacionActual?.id === conversacion.id}
                    onClick={() => onSeleccionarConversacion(conversacion)}
                    className={`d-flex justify-content-between align-items-start py-3 ${isDarkMode && !conversacionActual?.id === conversacion.id ? 'bg-dark text-light border-secondary' : ''}`}
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">{conversacion.otro_usuario_nombre}</div>
                        <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {conversacion.ultimo_mensaje}
                        </div>
                        <small className={isDarkMode ? "text-light-50" : "text-muted"}>
                            {formatearFecha(conversacion.fecha_actualizacion)}
                        </small>
                    </div>
                    {conversacion.mensajes_no_leidos > 0 && (
                        <Badge bg="primary" pill>
                            {conversacion.mensajes_no_leidos}
                        </Badge>
                    )}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}

export default ListaConversaciones;