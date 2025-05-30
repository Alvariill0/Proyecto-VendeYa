import React from 'react';

function CategoriasModal({ mostrar, alCerrar, categorias }) {
    if (!mostrar) {
        return null;
    }

    return (
        <div className="modal show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Todas las Categorías</h5>
                        <button type="button" className="btn-close" aria-label="Cerrar" onClick={alCerrar}></button>
                    </div>
                    <div className="modal-body">
                        {/* Aquí listaremos las categorías */}
                        {categorias.length > 0 ? (
                            <ul>
                                {categorias.map(categoria => (
                                    <li key={categoria.id}>{categoria.nombre}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay categorías disponibles.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={alCerrar}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoriasModal; 