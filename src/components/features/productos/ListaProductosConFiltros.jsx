import React, { useEffect, useState } from 'react';
import { listarProductos } from '../../../services/servicioProductos';
import { listarCategorias } from '../../../services/servicioCategorias';
import { useCarrito } from '../../../context/ContextoCarrito';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { Link } from 'react-router-dom';

function ListaProductosConFiltros({ categoriaId, terminoBusqueda }) {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const { agregar, error: errorCarrito } = useCarrito();
    const { usuario } = useAutenticacion();
    
    // Estados para filtros adicionales
    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');
    const [soloConStock, setSoloConStock] = useState(true);
    const [filtroLocal, setFiltroLocal] = useState('');
    const [ordenamiento, setOrdenamiento] = useState('default'); // Nuevo estado para ordenamiento

    // Effect para cargar productos cuando cambia categoriaId o terminoBusqueda
    useEffect(() => {
        console.log('useEffect productos: categoriaId', categoriaId, 'terminoBusqueda', terminoBusqueda);
        const obtenerProductos = async () => {
            try {
                setCargando(true);
                setError(null);
                const productosObtenidos = await listarProductos(categoriaId, terminoBusqueda);
                setProductos(productosObtenidos);
            } catch (error) {
                setError(error.message);
                console.error('Error al obtener productos:', error);
            } finally {
                setCargando(false);
            }
        };

        obtenerProductos();
    }, [categoriaId, terminoBusqueda]); // Volver a cargar productos cuando categoriaId o terminoBusqueda cambien

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

    // Función para aplicar filtros locales a los productos
    const productosFiltrados = () => {
        // Primero filtramos los productos
        const filtrados = productos.filter(producto => {
            // Filtro por precio mínimo
            if (precioMin && parseFloat(producto.precio) < parseFloat(precioMin)) {
                return false;
            }
            
            // Filtro por precio máximo
            if (precioMax && parseFloat(producto.precio) > parseFloat(precioMax)) {
                return false;
            }
            
            // Filtro por stock
            if (soloConStock && parseInt(producto.stock) <= 0) {
                return false;
            }
            
            // Filtro local por nombre o descripción
            if (filtroLocal && !producto.nombre.toLowerCase().includes(filtroLocal.toLowerCase()) && 
                !producto.descripcion.toLowerCase().includes(filtroLocal.toLowerCase())) {
                return false;
            }
            
            return true;
        });

        // Luego ordenamos según el criterio seleccionado
        return ordenarProductos(filtrados);
    };

    // Función para ordenar los productos según el criterio seleccionado
    const ordenarProductos = (productosAOrdenar) => {
        const productosOrdenados = [...productosAOrdenar]; // Crear copia para no mutar el original
        
        switch (ordenamiento) {
            case 'nombre_asc':
                return productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            case 'nombre_desc':
                return productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
            case 'precio_asc':
                return productosOrdenados.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
            case 'precio_desc':
                return productosOrdenados.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
            case 'stock_asc':
                return productosOrdenados.sort((a, b) => parseInt(a.stock) - parseInt(b.stock));
            case 'stock_desc':
                return productosOrdenados.sort((a, b) => parseInt(b.stock) - parseInt(a.stock));
            default:
                return productosOrdenados; // Sin ordenamiento específico
        }
    };
    
    // Determinar el título a mostrar
    let tituloPrincipal = 'Productos Destacados';
    
    if (categoriaId && categorias.length > 0) {
        tituloPrincipal = `Productos en ${obtenerNombreCategoria(categoriaId)}`;
    }
    
    if (terminoBusqueda) {
        tituloPrincipal = `Resultados para "${terminoBusqueda}"`;
    }

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
            
            {/* Columna para filtros */}
            <div className="col-md-3">
                <div className="card">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0"><i className="bi bi-funnel-fill me-2"></i> Filtros</h5>
                    </div>
                    <div className="card-body">
                        {/* Filtro por nombre o descripción */}
                        <div className="mb-3">
                            <label htmlFor="filtroLocal" className="form-label">Buscar en resultados:</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="filtroLocal" 
                                placeholder="Nombre o descripción..." 
                                value={filtroLocal}
                                onChange={(e) => setFiltroLocal(e.target.value)}
                            />
                        </div>
                        
                        {/* Filtro por rango de precios */}
                        <div className="mb-3">
                            <label className="form-label">Rango de precios:</label>
                            <div className="d-flex gap-2">
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Min €" 
                                    value={precioMin}
                                    onChange={(e) => setPrecioMin(e.target.value)}
                                    min="0"
                                />
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Max €" 
                                    value={precioMax}
                                    onChange={(e) => setPrecioMax(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                        
                        {/* Filtro por disponibilidad */}
                        <div className="form-check form-switch mb-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="soloConStock" 
                                checked={soloConStock}
                                onChange={(e) => setSoloConStock(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="soloConStock">
                                Solo productos con stock
                            </label>
                        </div>
                        
                        {/* Selector de ordenamiento */}
                        <div className="mb-3">
                            <label htmlFor="ordenamiento" className="form-label">Ordenar por:</label>
                            <select 
                                className="form-select" 
                                id="ordenamiento"
                                value={ordenamiento}
                                onChange={(e) => setOrdenamiento(e.target.value)}
                            >
                                <option value="default">Predeterminado</option>
                                <option value="nombre_asc">Nombre (A-Z)</option>
                                <option value="nombre_desc">Nombre (Z-A)</option>
                                <option value="precio_asc">Precio (menor a mayor)</option>
                                <option value="precio_desc">Precio (mayor a menor)</option>
                                <option value="stock_asc">Stock (menor a mayor)</option>
                                <option value="stock_desc">Stock (mayor a menor)</option>
                            </select>
                        </div>

                        {/* Botón para limpiar filtros */}
                        <button 
                            className="btn btn-outline-secondary w-100"
                            onClick={() => {
                                setPrecioMin('');
                                setPrecioMax('');
                                setSoloConStock(true);
                                setFiltroLocal('');
                                setOrdenamiento('default');
                            }}
                        >
                            <i className="bi bi-x-circle me-2"></i> Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Columna para la lista de productos */}
            <div className="col-md-9">
                {/* Título dinámico */}
                <h2 className="mb-4 text-center">{tituloPrincipal}</h2>

                {productosFiltrados().length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {productosFiltrados().map((producto) => (
                            <div key={producto.id} className="col">
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