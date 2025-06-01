import React, { useEffect } from 'react';
import { useTheme } from '../../context/ContextoTema';

function Modal({ isOpen, onClose, children }) {
    const { isDarkMode } = useTheme();

    // Evitar scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    // Manejar el cierre al hacer clic en el fondo
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="modal fade show" 
            style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleBackdropClick}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className={`modal-content ${isDarkMode ? 'bg-dark text-light' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;