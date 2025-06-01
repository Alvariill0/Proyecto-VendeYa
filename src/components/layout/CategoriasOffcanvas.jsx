import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ContextoTema';

function CategoriasOffcanvas({ mostrar, alCerrar, categorias }) {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const manejarClickCategoria = (categoriaId) => {
        alCerrar(); // Cerrar el offcanvas
        navigate(`/principal/${categoriaId}`); // Navegar a la ruta de productos filtrados
    };

    return (
        <div 
            className={`offcanvas offcanvas-start ${mostrar ? 'show' : ''} ${isDarkMode ? 'bg-dark text-light' : ''}`}
            tabIndex="-1"
            id="categoriasOffcanvas"
            aria-labelledby="categoriasOffcanvasLabel"
            style={{ visibility: mostrar ? 'visible' : 'hidden' }}
        >
            <div className={`offcanvas-header ${isDarkMode ? 'border-secondary' : ''}`}>
                <h5 className="offcanvas-title" id="categoriasOffcanvasLabel">Todas las Categorías</h5>
                <button type="button" className={`btn-close ${isDarkMode ? 'btn-close-white' : ''}`} aria-label="Cerrar" onClick={alCerrar}></button>
            </div>
            <div className="offcanvas-body">
                {/* Aquí listaremos las categorías y subcategorías */}
                {categorias.length > 0 ? (
                    <ul className="list-unstyled">
                        {categorias.map(categoria => (
                            <li key={categoria.id}>
                                <button 
                                    className="btn btn-link p-0 border-0 text-decoration-none categoria-menu-item"
                                    style={{ color: isDarkMode ? 'var(--bs-light)' : 'var(--bs-dark)' }}
                                    onClick={() => manejarClickCategoria(categoria.id)}
                                >
                                    <strong>{categoria.nombre}</strong>
                                </button>
                                {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                                    <ul className="list-unstyled ms-3">
                                        {categoria.subcategorias.map(subcategoria => (
                                            <li key={subcategoria.id}>
                                                <button 
                                                    className="btn btn-link p-0 border-0 text-decoration-none subcategoria-menu-item"
                                                    style={{ color: isDarkMode ? 'var(--bs-light)' : 'var(--bs-dark)' }}
                                                    onClick={() => manejarClickCategoria(subcategoria.id)}
                                                >
                                                    - {subcategoria.nombre}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay categorías disponibles.</p>
                )}
            </div>
        </div>
    );
}

export default CategoriasOffcanvas;