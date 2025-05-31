import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ContextoTema';

/**
 * Componente que muestra el área de chat con los mensajes de la conversación
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.mensajes - Lista de mensajes de la conversación
 * @param {Object} props.usuarioActual - Usuario autenticado actualmente
 * @param {Function} props.formatearFecha - Función para formatear fechas
 * @returns {JSX.Element} Componente de área de chat
 */
function AreaChat({ mensajes, usuarioActual, formatearFecha }) {
    const chatContainerRef = useRef(null);
    const { isDarkMode } = useTheme();

    // Desplazar al final cuando se cargan nuevos mensajes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [mensajes]);

    return (
        <div 
            className="chat-container p-3" 
            ref={chatContainerRef}
            style={{ 
                height: '400px', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {mensajes.map(mensaje => {
                const esPropio = mensaje.remitente_id === usuarioActual.id;
                
                return (
                    <div 
                        key={mensaje.id} 
                        className={`d-flex mb-3 ${esPropio ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                        <div 
                            className={`mensaje p-3 rounded ${esPropio ? 'bg-primary text-white' : isDarkMode ? 'bg-secondary text-light' : 'bg-light'}`}
                            style={{ 
                                maxWidth: '75%',
                                position: 'relative'
                            }}
                        >
                            <div>{mensaje.contenido}</div>
                            <div 
                                className={`mensaje-tiempo ${esPropio ? 'text-white-50' : isDarkMode ? 'text-light-50' : 'text-muted'}`}
                                style={{ 
                                    fontSize: '0.75rem',
                                    textAlign: 'right',
                                    marginTop: '4px'
                                }}
                            >
                                {formatearFecha(mensaje.fecha_creacion, true)}
                                {mensaje.leido && esPropio && (
                                    <span className="ms-1">✓</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default AreaChat;