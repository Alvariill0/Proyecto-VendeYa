import React from 'react';

/**
 * Componente para mostrar un modal de confirmación
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.mostrar - Si es true, muestra el modal
 * @param {string} props.titulo - Título del modal
 * @param {string} props.mensaje - Mensaje del modal
 * @param {string} props.textoConfirmar - Texto del botón de confirmación
 * @param {string} props.textoCancelar - Texto del botón de cancelación
 * @param {Function} props.onConfirmar - Función a ejecutar al confirmar
 * @param {Function} props.onCancelar - Función a ejecutar al cancelar
 * @param {boolean} props.procesando - Si es true, muestra un spinner en el botón de confirmación
 * @param {string} props.colorBotonConfirmar - Color del botón de confirmación (danger, primary, etc.)
 * @returns {JSX.Element|null} Modal de confirmación o null si no se debe mostrar
 */
function ModalConfirmacion({
    mostrar,
    titulo = 'Confirmar acción',
    mensaje = '¿Estás seguro de que deseas realizar esta acción?',
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    onConfirmar,
    onCancelar,
    procesando = false,
    colorBotonConfirmar = 'danger'
}) {
    if (!mostrar) return null;

    return (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{titulo}</h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onCancelar} 
                            disabled={procesando}
                            aria-label="Cerrar"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <p>{mensaje}</p>
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onCancelar}
                            disabled={procesando}
                        >
                            {textoCancelar}
                        </button>
                        <button 
                            type="button" 
                            className={`btn btn-${colorBotonConfirmar}`} 
                            onClick={onConfirmar}
                            disabled={procesando}
                        >
                            {procesando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Procesando...
                                </>
                            ) : textoConfirmar}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmacion;