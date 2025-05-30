import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/VendeYa_Logo.png'
// Importa aquí los iconos que necesites (ej: react-icons)

function HeaderAutenticado() {
  // Aquí podrías usar el contexto de autenticación para obtener datos del usuario si fuera necesario
  // const { usuario } = useAutenticacion();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="VendeYa Logo" height="40" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAutenticado">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNavAutenticado">
          {/* Buscador */}
          <form className="d-flex me-auto mb-2 mb-lg-0">
            <input className="form-control me-2" type="search" placeholder="Buscar productos" aria-label="Search" />
            <button className="btn btn-outline-success" type="submit">Buscar</button>
          </form>

          {/* Menú de navegación para usuarios autenticados */}
          <ul className="navbar-nav">
            {/* Enlace a Buzón (ejemplo con texto) */}
            <li className="nav-item">
              <Link className="nav-link" to="/buzon">Buzón</Link>
            </li>
            {/* Enlace a Perfil (ejemplo con texto) */}
            <li className="nav-item">
              <Link className="nav-link" to="/perfil">Perfil</Link>
            </li>
            {/* Botón para Vender */}
            <li className="nav-item">
              <Link className="nav-link btn btn-primary text-white ms-2" to="/vender-producto">Vender</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default HeaderAutenticado 