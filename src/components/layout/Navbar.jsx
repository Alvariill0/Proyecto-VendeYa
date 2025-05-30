import { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoriasOffcanvas from './CategoriasOffcanvas';
import { listarCategorias } from '../../services/servicioProductos';

export default function Navbar() {
    const [mostrarOffcanvas, setMostrarOffcanvas] = useState(false);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(false);
    const [errorCategorias, setErrorCategorias] = useState(null);

    const abrirOffcanvasCategorias = async () => {
        setMostrarOffcanvas(true);
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

    const cerrarOffcanvasCategorias = () => {
        setMostrarOffcanvas(false);
    };

    return (
        <nav className="bg-light border-bottom">
            <div className="container-fluid">
                <div className="d-flex align-items-center py-2">
                    {/* Botón para ver todas las categorías */}
                    <button 
                        className="btn btn-outline-secondary me-3"
                        type="button"
                        onClick={abrirOffcanvasCategorias}
                        disabled={cargandoCategorias}
                    >
                        {cargandoCategorias ? 'Cargando...' : 'Ver todas las categorías'}
                    </button>
                    
                    <span className="me-3">Categorías Populares:</span>
                    <div className="d-flex gap-3">
                        <Link to="/categoria/electronica" className="text-decoration-none text-dark">
                            Electrónica
                        </Link>
                        <Link to="/categoria/ropa" className="text-decoration-none text-dark">
                            Ropa
                        </Link>
                        <Link to="/categoria/hogar" className="text-decoration-none text-dark">
                            Hogar
                        </Link>
                        <Link to="/categoria/deportes" className="text-decoration-none text-dark">
                            Deportes
                        </Link>
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