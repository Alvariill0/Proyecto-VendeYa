import React from 'react';
import { useCarrito } from '../context/ContextoCarrito';

function ListaProductos() {
  const { agregar } = useCarrito();

  const productos = [
    { id: 1, nombre: 'Producto 1', precio: 10, imagen: 'https://via.placeholder.com/150' },
    { id: 2, nombre: 'Producto 2', precio: 20, imagen: 'https://via.placeholder.com/150' },
    { id: 3, nombre: 'Producto 3', precio: 30, imagen: 'https://via.placeholder.com/150' },
  ];

  const handleAgregarAlCarrito = (productoId) => {
    agregar(productoId);
  };

  return (
    <div className="container">
      <h2 className="text-center my-4">Listado de Productos</h2>
      <div className="row">
        {productos.map(producto => (
          <div key={producto.id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div className="card h-100">
              <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{producto.nombre}</h5>
                <p className="card-text">Precio: {producto.precio}€</p>
                <button className="btn btn-primary mt-auto" onClick={() => handleAgregarAlCarrito(producto.id)}>Añadir al Carrito</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListaProductos;