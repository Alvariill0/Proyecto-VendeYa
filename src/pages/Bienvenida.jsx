import { Link } from 'react-router-dom';
import logo from '../assets/VendeYa_Logo-nobg.png';
import { useTheme } from '../context/ContextoTema';
import { FaGoogle, FaFacebook, FaEnvelope, FaMoon, FaSun } from 'react-icons/fa';

export default function Bienvenida() {
    const { isDarkMode, toggleTheme } = useTheme();
    
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" 
            style={{ 
                background: isDarkMode ? 'linear-gradient(135deg, #2c3e50, #1a1a2e)' : 'linear-gradient(135deg, #f5f7fa, #c3cfe2)' 
            }}>
            {/* Botón de toggle de tema */}
            <div className="position-absolute top-0 end-0 m-3">
                <button 
                    onClick={toggleTheme} 
                    className={`btn ${isDarkMode ? 'btn-outline-light' : 'btn-outline-dark'} d-flex align-items-center gap-2`}
                    aria-label="Cambiar tema"
                >
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
            </div>
            
            <div className={`card shadow-lg ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-white'}`} 
                style={{ maxWidth: '450px', width: '100%' }}>
                <div className="card-body p-5">
                    {/* Logo centrado */}
                    <div className="text-center mb-4">
                        <img src={logo} alt="VendeYa Logo" height="100" />
                    </div>
                    
                    {/* Mensaje de bienvenida */}
                    <div className="text-center mb-4">
                        <h2 className="mb-3">Regístrate o inicia sesión.</h2>
                        <p className={`${isDarkMode ? 'text-light-50' : 'text-muted'} mb-4`}>¡Te estamos esperando!</p>
                    </div>
                    
                    {/* Botones de inicio de sesión */}
                    <div className="d-grid gap-3 mb-3">
                        <Link to="/registro" className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2">
                            <FaGoogle /> Continuar con Google
                        </Link>
                        <Link to="/registro" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2">
                            <FaFacebook /> Continuar con Facebook
                        </Link>
                        <Link to="/registro" className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2">
                            <FaEnvelope /> Continuar con el e-mail
                        </Link>
                    </div>
                    
                    {/* Enlace para iniciar sesión */}
                    <div className="text-center mt-3">
                        <small className={isDarkMode ? 'text-light-50' : 'text-muted'}>¿Ya tienes una cuenta? <Link to="/login" className="text-decoration-none">Iniciar sesión</Link></small>
                    </div>
                </div>
            </div>
        </div>
    );
}