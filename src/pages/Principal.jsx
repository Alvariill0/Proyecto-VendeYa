import { useEffect, useState } from 'react';

export default function Principal() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Aquí irá la llamada a la API para obtener los productos
        // Por ahora usamos datos de ejemplo
        setProductos([
            {
                id: 1,
                nombre: 'Producto 1',
                precio: 99.99,
                imagen: 'https://via.placeholder.com/150',
                vendedor: 'Usuario 1'
            },
            {
                id: 2,
                nombre: 'Producto 2',
                precio: 149.99,
                imagen: 'https://via.placeholder.com/150',
                vendedor: 'Usuario 2'
            },
            // Añade más productos de ejemplo aquí
        ]);
        setCargando(false);
    }, []);

    if (cargando) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="mb-4">Productos Destacados</h2>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {productos.map((producto) => (
                    <div key={producto.id} className="col">
                        <div className="card h-100">
                            <img
                                src={producto.imagen}
                                className="card-img-top"
                                alt={producto.nombre}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{producto.nombre}</h5>
                                <p className="card-text text-muted">
                                    Vendedor: {producto.vendedor}
                                </p>
                                <p className="card-text fw-bold">
                                    {producto.precio.toFixed(2)} €
                                </p>
                                <button className="btn btn-primary w-100">
                                    Ver Detalles
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 