import React, { useState } from 'react';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useTheme } from '../../../context/ContextoTema';

function EditarPerfil({ onClose }) {
    const { usuario, actualizarPerfil, cargando, error } = useAutenticacion();
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        email: usuario?.email || ''
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
        try {
            setMensaje(null);
            await actualizarPerfil(formData);
            setMensaje({
                tipo: 'success',
                texto: 'Perfil actualizado correctamente'
            });
            // Esperar 2 segundos y cerrar el modal
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (error) {
            setMensaje({
                tipo: 'danger',
                texto: `Error al actualizar el perfil: ${error.message}`
            });
        }
    };

    return (
        <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title">Editar Perfil</h5>
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
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                            type="text"
                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
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
                            ) : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditarPerfil;