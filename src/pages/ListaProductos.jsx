import React, { useState, useEffect } from 'react';
import { useCarrito } from '../context/ContextoCarrito';
import { listarProductos } from '../services/servicioProductos';
import { Link } from 'react-router-dom';
import { useAutenticacion } from '../context/ContextoAutenticacion';

function ListaProductos() {
  const { agregar } = useCarrito();
  const { usuario } = useAutenticacion();
  const [productos, setProductos] = useState([]);
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [productosRecientes, setProductosRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Obtener productos de la base de datos
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setCargando(true);
        setError(null);
        const productosObtenidos = await listarProductos();
        setProductos(productosObtenidos);

        // Productos destacados (los más caros) - limitados a 4 (una fila)
        const destacados = [...productosObtenidos].sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio)).slice(0, 4);
        setProductosDestacados(destacados);

        // Productos recientes (por fecha de creación) - limitados a 12 (tres filas de 4)
        // La API ya devuelve los productos ordenados por created_at DESC
        setProductosRecientes(productosObtenidos.slice(0, 12));
      } catch (error) {
        setError(error.message);
        console.error('Error al obtener productos:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []);

  // Función para manejar la adición al carrito
  const handleAgregarAlCarrito = async (producto) => {
    // Limpiar mensajes anteriores
    setMensajeExito('');
    setMensajeError('');
    
    // Verificar si el usuario es el propietario del producto
    if (usuario && usuario.id === parseInt(producto.vendedor_id)) {
      setMensajeError(`No puedes añadir tu propio producto "${producto.nombre}" al carrito`);
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }

    try {
      // Si no es el propietario, proceder con la adición al carrito
      await agregar(producto.id, 1);
      setMensajeExito(`${producto.nombre} añadido al carrito`);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(`Error: ${error.message}`);
      setTimeout(() => setMensajeError(''), 3000);
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar productos: {error}
      </div>
    );
  }

  // Renderizar tarjeta de producto (componente reutilizable)
  const renderProductoCard = (producto) => (
    <div key={producto.id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow border-0 producto-card">
        <div className="position-relative overflow-hidden">
          <img 
            src={producto.imagen} 
            className="card-img-top" 
            alt={producto.nombre} 
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {producto.stock <= 0 && (
            <div className="position-absolute top-0 end-0 bg-danger text-white m-2 px-2 py-1 rounded-pill shadow-sm">
              <small><i className="bi bi-x-circle me-1"></i>Agotado</small>
            </div>
          )}
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-truncate">{producto.nombre}</h5>
          <p className="card-text text-muted small mb-1">
            <i className="bi bi-person-circle me-1"></i> {producto.vendedor_nombre}
          </p>
          <p className="card-text fw-bold fs-4 text-primary mb-1">
            {parseFloat(producto.precio).toFixed(2)} €
          </p>
          <p className="card-text small mb-3">
            <span className={`badge ${producto.stock > 0 ? 'bg-success' : 'bg-secondary'} shadow-sm`}>
              <i className="bi bi-box-seam me-1"></i> Stock: {producto.stock}
            </span>
          </p>
          <div className="d-flex gap-2 mt-auto">
            <Link to={`/producto/${producto.id}`} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center shadow-sm">
              <i className="bi bi-eye-fill me-2"></i> Ver Detalles
            </Link>
            {usuario && usuario.id === parseInt(producto.vendedor_id) ? (
              <Link to={`/editar-producto/${producto.id}`} className="btn btn-warning d-flex align-items-center shadow-sm">
                <i className="bi bi-pencil-fill fs-5"></i>
              </Link>
            ) : (
              <button 
                className="btn btn-success d-flex align-items-center shadow-sm" 
                onClick={() => handleAgregarAlCarrito(producto)}
                disabled={producto.stock <= 0}
                title={producto.stock <= 0 ? "Sin stock disponible" : "Añadir al carrito"}
              >
                <i className="bi bi-cart-plus-fill fs-5"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {/* Mensaje de éxito */}
      {mensajeExito && !mensajeError && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {mensajeExito}
          <button type="button" className="btn-close" onClick={() => setMensajeExito('')}></button>
        </div>
      )}

      {/* Mensaje de error */}
      {mensajeError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {mensajeError}
          <button type="button" className="btn-close" onClick={() => setMensajeError('')}></button>
        </div>
      )}

      {/* Sección de productos destacados */}
      <section className="mb-5">
        <h2 className="text-center my-4">Productos Destacados</h2>
        <div className="row">
          {productosDestacados.map(renderProductoCard)}
        </div>
      </section>

      {/* Sección de productos recientes */}
      <section>
        <h2 className="text-center my-4">Subidos Recientemente</h2>
        <div className="row">
          {productosRecientes.map(renderProductoCard)}
        </div>
      </section>
    </div>
  );
}

export default ListaProductos;