import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="bg-light border-bottom">
            <div className="container-fluid">
                <div className="d-flex align-items-center py-2">
                    {/* Botón para ver todas las categorías */}
                    <button className="btn btn-outline-secondary me-3" type="button">
                        Ver todas las categorías
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
        </nav>
    );
} 