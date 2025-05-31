import React, { useEffect, useState } from 'react';
import { listarProductos } from '../../../services/servicioProductos';
import { listarCategorias } from '../../../services/servicioCategorias';
import { useCarrito } from '../../../context/ContextoCarrito';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { Link } from 'react-router-dom';

function ListaProductosConFiltros({ categoriaId }) {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const { agregar, error: errorCarrito } = useCarrito();
    const { usuario } = useAutenticacion();

    // Effect para cargar productos cuando cambia categoriaId
    useEffect(() => {
        console.log('useEffect productos: categoriaId', categoriaId);
        const obtenerProductos = async () => {
            try {
                setCargando(true);
                setError(null);
                const productosObtenidos = await listarProductos(categoriaId);
                setProductos(productosObtenidos);
            } catch (error) {
                setError(error.message);
                console.error('Error al obtener productos:', error);
            } finally {
                setCargando(false);
            }
        };

        obtenerProductos();
    }, [categoriaId]); // Volver a cargar productos cuando categoriaId cambie

    // Effect para cargar categorías (solo una vez al montar el componente)
    useEffect(() => {
        console.log('useEffect categorias: cargando categorías');
        const obtenerCategorias = async () => {
            try {
                const categoriasObtenidas = await listarCategorias();
                console.log('Categorías cargadas:', categoriasObtenidas);
                setCategorias(categoriasObtenidas);
            } catch (error) {
                console.error('Error al obtener categorías para el título:', error);
                // No mostramos error al usuario si falla la carga de categorías para el título, solo en consola.
            }
        };

        obtenerCategorias();
    }, []); // Array de dependencias vacío para que se ejecute solo una vez

    // Effect para mostrar errores del carrito
    useEffect(() => {
        if (errorCarrito) {
            setMensajeError(errorCarrito);
            // Limpiar mensaje de éxito si hay un error
            setMensajeExito('');
            setTimeout(() => setMensajeError(''), 3000);
        }
    }, [errorCarrito]);

    // Función para encontrar una categoría por ID en la estructura anidada
    const encontrarCategoriaPorId = (id, categoriasLista) => {
        for (const categoria of categoriasLista) {
            // Comparar ID actual (asegurando que ambos son números)
            if (parseInt(categoria.id) === parseInt(id)) {
                return categoria;
            }
            // Si tiene subcategorías, buscar recursivamente en ellas
            if (categoria.subcategorias && categoria.subcategorias.length > 0) {
                const categoriaEnSub = encontrarCategoriaPorId(id, categoria.subcategorias);
                if (categoriaEnSub) {
                    return categoriaEnSub;
                }
            }
        }
        return undefined; // No se encontró la categoría
    };

    // Función para obtener el nombre de la categoría por su ID (usando búsqueda recursiva)
    const obtenerNombreCategoria = (id) => {
        console.log('obtenerNombreCategoria: buscando id', id, 'en categorías:', categorias);
        // Usar la función recursiva para encontrar la categoría en cualquier nivel
        const categoriaEncontrada = encontrarCategoriaPorId(id, categorias);
        // Mensaje de depuración
        console.log('Categoría encontrada (paso 1 - recursiva):', categoriaEncontrada);

        // Si se encontró la categoría y tiene un parent_id, buscamos su padre para el breadcrumb
        if (categoriaEncontrada && categoriaEncontrada.parent_id !== null) {
            console.log('Es subcategoría. parent_id:', categoriaEncontrada.parent_id);
            // Usar la función recursiva nuevamente para encontrar al padre
            const padre = encontrarCategoriaPorId(categoriaEncontrada.parent_id, categorias);
            console.log('Categoría padre encontrada:', padre);
            return padre ? `${padre.nombre} > ${categoriaEncontrada.nombre}` : categoriaEncontrada.nombre;
        }
        // Si no se encontró la categoría principal o no es subcategoría
        return categoriaEncontrada ? categoriaEncontrada.nombre : 'Categoría Desconocida';
    };

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

    // Determinar el título a mostrar
    const tituloPrincipal = categoriaId && categorias.length > 0
        ? `Productos en ${obtenerNombreCategoria(categoriaId)}`
        : 'Productos Destacados';

    console.log('Render: categoriaId', categoriaId, 'tituloPrincipal', tituloPrincipal);


    return (
        <div className="row">
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
            
            {/* Columna para filtros (placeholder) */}
            <div className="col-md-3">
                <h5>Filtros</h5>
                {/* Aquí irán los filtros más adelante */}
                <p>Espacio para filtros...</p>
            </div>

            {/* Columna para la lista de productos */}
            <div className="col-md-9">
                {/* Título dinámico */}
                <h2 className="mb-4 text-center">{tituloPrincipal}</h2>

                {productos.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
                                            Vendedor: {producto.vendedor_nombre}
                                        </p>
                                        <p className="card-text fw-bold">
                                            {parseFloat(producto.precio).toFixed(2)} €
                                        </p>
                                        <p className="card-text">
                                            Stock: {producto.stock}
                                        </p>
                                        <div className="d-flex gap-2 mt-2">
                                            <Link to={`/producto/${producto.id}`} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center">
                                                <i className="bi bi-eye-fill me-2"></i> Ver Detalles
                                            </Link>
                                            {usuario && usuario.id === parseInt(producto.vendedor_id) ? (
                                                <Link to={`/editar-producto/${producto.id}`} className="btn btn-outline-warning d-flex align-items-center">
                                                    <i className="bi bi-pencil-fill fs-5"></i>
                                                </Link>
                                            ) : (
                                                <button 
                                                    className="btn btn-outline-success d-flex align-items-center" 
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
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info" role="alert">
                        No se encontraron productos en esta categoría.
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListaProductosConFiltros;