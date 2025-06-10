import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoriasOffcanvas from './CategoriasOffcanvas';
import { listarCategorias } from '../../services/servicioCategorias';
import { useTheme } from '../../context/ContextoTema';

export default function Navbar() {
    const [mostrarOffcanvas, setMostrarOffcanvas] = useState(false);
    const [mostrarCategoriasPopulares, setMostrarCategoriasPopulares] = useState(false);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(false);
    const [errorCategorias, setErrorCategorias] = useState(null);
    const { isDarkMode } = useTheme();

    // Cargar categorías al montar el componente
    useEffect(() => {
        const cargarCategorias = async () => {
            if (listaCategorias.length === 0) {
                try {
                    setCargandoCategorias(true);
                    setErrorCategorias(null);
                    const categoriasObtenidas = await listarCategorias();
                    setListaCategorias(categoriasObtenidas);
                } catch (error) {
                    setErrorCategorias(error.message);
                    console.error('Error al obtener categorías:', error);
                } finally {
                    setCargandoCategorias(false);
                }
            }
        };
        
        cargarCategorias();
    }, []);

    // Ordenar y seleccionar las 4 categorías con más productos
    const categoriasConMasProductos = listaCategorias.sort((a, b) => b.productosCount - a.productosCount).slice(0, 4);

    const abrirOffcanvasCategorias = () => {
        setMostrarOffcanvas(true);
    };

    const cerrarOffcanvasCategorias = () => {
        setMostrarOffcanvas(false);
    };

    const toggleCategoriasPopulares = () => {
        setMostrarCategoriasPopulares(!mostrarCategoriasPopulares);
    };

    return (
        <nav className={`navbar border-bottom ${isDarkMode ? 'bg-dark border-secondary' : 'navbar-green'}`}>
            <div className="container-fluid">
                <div className="d-flex align-items-center py-2">
                    {/* Botón para ver todas las categorías */}
                    <button 
                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-light'} me-3`}
                        type="button"
                        onClick={abrirOffcanvasCategorias}
                        disabled={cargandoCategorias}
                    >
                        {cargandoCategorias ? 'Cargando...' : 'Ver todas las categorías'}
                    </button>
                    
                    {/* Categorías populares - Solo visible en desktop */}
                    <div className="d-none d-md-flex align-items-center">
                        <span className={`me-3 ${isDarkMode ? 'text-light' : 'text-white'}`}>Categorías Populares:</span>
                        <div className="d-flex gap-3">
                            {listaCategorias.length > 0 ? (
                                categoriasConMasProductos.length > 0 ? (
                                    categoriasConMasProductos.map(categoria => (
                                        <Link 
                                            key={categoria.id} 
                                            to={`/principal/${categoria.id}`} 
                                            className={`categoria-link ${isDarkMode ? 'text-light' : 'text-white'}`}
                                        >
                                            {categoria.nombre}
                                        </Link>
                                    ))
                                ) : (
                                    <Link 
                                        to="#" 
                                        className={`categoria-link ${isDarkMode ? 'text-light' : 'text-white'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            abrirOffcanvasCategorias();
                                        }}
                                    >
                                        Cargando categorías...
                                    </Link>
                                )
                            ) : (
                                <span>Cargando categorías...</span>
                            )}
                        </div>
                    </div>

                    {/* Botón de categorías populares para móvil */}
                    <button 
                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-light'} d-md-none ms-auto`}
                        onClick={toggleCategoriasPopulares}
                    >
                        <i className="bi bi-list me-2"></i>
                        Categorías Populares
                    </button>
                </div>

                {/* Menú desplegable de categorías populares para móvil */}
                <div className={`d-md-none ${mostrarCategoriasPopulares ? 'd-block' : 'd-none'} py-2 border-top`}>
                    <div className="d-flex flex-column gap-2">
                        {listaCategorias.length > 0 ? (
                            categoriasConMasProductos.length > 0 ? (
                                categoriasConMasProductos.map(categoria => (
                                    <Link 
                                        key={categoria.id} 
                                        to={`/principal/${categoria.id}`} 
                                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-light'} w-100 text-start`}
                                        onClick={() => setMostrarCategoriasPopulares(false)}
                                    >
                                        {categoria.nombre}
                                    </Link>
                                ))
                            ) : (
                                <button 
                                    className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-light'} w-100 text-start`}
                                    onClick={() => {
                                        setMostrarCategoriasPopulares(false);
                                        abrirOffcanvasCategorias();
                                    }}
                                >
                                    Cargando categorías...
                                </button>
                            )
                        ) : (
                            <span>Cargando categorías...</span>
                        )}
                    </div>
                </div>

                {/* Offcanvas de Categorías */}
                <CategoriasOffcanvas 
                    mostrar={mostrarOffcanvas}
                    alCerrar={cerrarOffcanvasCategorias}
                    categorias={listaCategorias}
                />

                {/* Mostrar error si falla la carga de categorías */}
                {errorCategorias && (
                    <div className="alert alert-danger m-3" role="alert">
                        Error al cargar categorías: {errorCategorias}
                    </div>
                )}
            </div>
        </nav>
    );
}

