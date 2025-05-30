import React from 'react'
import { Link } from 'react-router-dom'
// Componente para el inicio

function Inicio() {
    return (
        <div className="container text-center">
            <h1 className="text-center my-4">Bienvenido a VendeYa</h1>
            <div className="row">
                <div className="col-12">
                    <p className="text-center">Tu marketplace de confianza</p>
                </div>
            </div>
            <div className="mt-4">
                <Link to="/iniciar-sesion" className="btn btn-primary m-2">Iniciar Sesión</Link>
                <Link to="/registro" className="btn btn-success m-2">Registrarse</Link>
            </div>
        </div>
    )
}

export default Inicio 