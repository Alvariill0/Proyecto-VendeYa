import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAutenticacion } from '../../context/ContextoAutenticacion'
import HeaderPublico from './HeaderPublico' // Aún no creado, lo haremos después
import HeaderAutenticado from './HeaderAutenticado' // Aún no creado, lo haremos después
import Inicio from '../../pages/Inicio'
import IniciarSesion from '../../pages/IniciarSesion'
import Registro from '../../pages/Registro'
import ListaProductos from '../../pages/ListaProductos'
// Importa aquí los otros componentes de página cuando los creemos

function Layout() {
  const { estaAutenticado, rol } = useAutenticacion()

  return (
    <div className="container-fluid p-0">
      {/* Renderizar el header basado en la autenticación */}
      {estaAutenticado ? <HeaderAutenticado /> : <HeaderPublico />}

      <main className="py-4">
        <Routes>
          {/* Rutas Públicas (accesibles por todos) */}
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<ListaProductos />} />
          {/* Agrega aquí más rutas públicas si es necesario (ej: DetalleProducto) */}

          {/* Rutas accesibles solo si NO está autenticado */}
          {!estaAutenticado && (
            <>
              <Route path="/iniciar-sesion" element={<IniciarSesion />} />
              <Route path="/registro" element={<Registro />} />
            </>
          )}

          {/* Redirigir si intenta acceder a rutas de autenticación estando logeado */}
          {estaAutenticado && (
              <Route path="/iniciar-sesion" element={<Navigate to="/" replace />} />
          )}
            {estaAutenticado && (
              <Route path="/registro" element={<Navigate to="/" replace />} />
          )}

          {/* Rutas protegidas (accesibles solo si está autenticado) */}
          {estaAutenticado && (
            <>
              {/* Agrega aquí las rutas protegidas para usuarios autenticados */}
              {/* <Route path="/perfil" element={<Perfil />} /> */}
              {/* <Route path="/carrito" element={<Carrito />} /> */}

              {/* Rutas específicas por rol (Ejemplo) */}
              {/* {rol === 'admin' && <Route path="/administracion" element={<Administracion />} />} */}
              {/* {rol === 'vendedor' && <Route path="/mis-productos" element={<MisProductos />} />} */}
            </>
          )}

          {/* Ruta comodín para 404 o redirigir a inicio si no se encuentra la ruta */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}

        </Routes>
      </main>
    </div>
  )
}

export default Layout 