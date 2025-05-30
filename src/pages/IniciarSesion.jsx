import React from 'react'
// Componente para iniciar sesión
function IniciarSesion() {
    return (
        <div className="container">
        <div className="row justify-content-center">
            <div className="col-md-6">
            <h2 className="text-center my-4">Iniciar Sesión</h2>
            <form>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                    <input type="email" className="form-control" id="email" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input type="password" className="form-control" id="password" required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
            </form>
            </div>
        </div>
        </div>
    )
}

export default IniciarSesion 