import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CategoriasOffcanvas from './CategoriasOffcanvas';
import { listarCategorias } from '../../services/servicioCategorias';
import { useTheme } from '../../context/ContextoTema';

export default function Navbar() {
    const [mostrarOffcanvas, setMostrarOffcanvas] = useState(false);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(false);
    const [errorCategorias, setErrorCategorias] = useState(null);
    const { isDarkMode } = useTheme();

    // Cargar categorías al montar el componente
    useEffect(() => {
        const cargarCategorias = async () => {
            if (listaCategorias.length === 0) { // Solo cargar si no se han cargado antes
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

    const abrirOffcanvasCategorias = () => {
        setMostrarOffcanvas(true);
    };

    const cerrarOffcanvasCategorias = () => {
        setMostrarOffcanvas(false);
    };

    return (
        <nav className={`navbar border-bottom ${isDarkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
            <div className="container-fluid">
                <div className="d-flex align-items-center py-2">
                    {/* Botón para ver todas las categorías */}
                    <button 
                        className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-secondary'} me-3`}
                        type="button"
                        onClick={abrirOffcanvasCategorias}
                        disabled={cargandoCategorias}
                    >
                        {cargandoCategorias ? 'Cargando...' : 'Ver todas las categorías'}
                    </button>
                    
                    <span className={`me-3 ${isDarkMode ? 'text-light' : 'text-dark'}`}>Categorías Populares:</span>
                    <div className="d-flex gap-3">
                        {/* Cargar categorías populares dinámicamente si están disponibles */}
                        {listaCategorias.length > 0 ? (
                            // Mostrar hasta 4 categorías principales como populares
                            listaCategorias.slice(0, 4).map(categoria => (
                                <Link 
                                    key={categoria.id} 
                                    to={`/principal/${categoria.id}`} 
                                    className={`text-decoration-none ${isDarkMode ? 'text-light' : 'text-dark'}`}
                                >
                                    {categoria.nombre}
                                </Link>
                            ))
                        ) : (
                            // Mostrar enlaces temporales mientras se cargan las categorías
                            <>
                                <Link 
                                    to="#" 
                                    className={`text-decoration-none ${isDarkMode ? 'text-light' : 'text-dark'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        abrirOffcanvasCategorias();
                                    }}
                                >
                                    Cargando categorías...
                                </Link>
                            </>
                        )}
                    </div>
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
        </nav>
    );
}