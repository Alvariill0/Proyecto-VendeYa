import React, { useState } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useTheme } from '../../../context/ContextoTema';

function CambiarPassword({ onClose }) {
    const { cambiarPassword, cargando } = useAutenticacion();
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: ''
    });
    const [mensaje, setMensaje] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar que las contraseñas coincidan
        if (formData.passwordNueva !== formData.confirmarPassword) {
            setMensaje({
                tipo: 'danger',
                texto: 'La nueva contraseña y la confirmación no coinciden'
            });
            return;
        }

        // Validar longitud mínima
        if (formData.passwordNueva.length < 6) {
            setMensaje({
                tipo: 'danger',
                texto: 'La contraseña debe tener al menos 6 caracteres'
            });
            return;
        }

        try {
            setMensaje(null);
            await cambiarPassword(formData.passwordActual, formData.passwordNueva);
            setMensaje({
                tipo: 'success',
                texto: 'Contraseña actualizada correctamente'
            });
            // Limpiar el formulario
            setFormData({
                passwordActual: '',
                passwordNueva: '',
                confirmarPassword: ''
            });
            // Esperar 2 segundos y cerrar el modal
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (error) {
            setMensaje({
                tipo: 'danger',
                texto: `Error al cambiar la contraseña: ${error.message}`
            });
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Cambiar Contraseña</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
                {mensaje && (
                    <div className={`alert alert-${mensaje.tipo}`} role="alert">
                        {mensaje.texto}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="passwordActual" className="form-label">Contraseña Actual</label>
                        <input
                            type="password"
                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                            id="passwordActual"
                            name="passwordActual"
                            value={formData.passwordActual}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="passwordNueva" className="form-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                            id="passwordNueva"
                            name="passwordNueva"
                            value={formData.passwordNueva}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                        <div className="form-text text-muted">
                            La contraseña debe tener al menos 6 caracteres
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmarPassword" className="form-label">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                            id="confirmarPassword"
                            name="confirmarPassword"
                            value={formData.confirmarPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={cargando}>
                            {cargando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CambiarPassword;