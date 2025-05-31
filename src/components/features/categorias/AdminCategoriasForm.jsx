import React, { useState, useEffect } from 'react';
import { listarCategorias, listarCategoriasSugeridas } from '../../../services/servicioCategorias';

function AdminCategoriasForm() {
    const [categorias, setCategorias] = useState([]);
    const [categoriasSugeridas, setCategoriasSugeridas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [exito, setExito] = useState('');
    
    // Estados para el formulario de nueva categoría
    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: '',
        descripcion: '',
        parent_id: ''
    });

    useEffect(() => {
        cargarCategorias();
        cargarCategoriasSugeridas();
    }, []);

    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const respuesta = await listarCategorias();
            // Asegurarse de que la respuesta es un array antes de actualizar el estado
            if (Array.isArray(respuesta)) {
                setCategorias(respuesta);
            } else {
                console.error('La respuesta de listarCategorias no es un array:', respuesta);
                setError('Error al cargar las categorías: formato de respuesta incorrecto');
            }
        } catch (error) {
            console.error('Error en cargarCategorias:', error);
            setError('Error al cargar las categorías: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarCategoriasSugeridas = async () => {
        try {
            setCargando(true);
            // Buscar productos con categorías sugeridas en la descripción
            const productos = await listarCategoriasSugeridas();
            if (Array.isArray(productos)) {
                // Extraer las categorías sugeridas de las descripciones
                const sugeridas = productos
                    .filter(producto => producto.descripcion && producto.descripcion.includes('[Categoría sugerida:'))
                    .map(producto => {
                        const match = producto.descripcion.match(/\[Categoría sugerida: ([^\]]+)\]/);
                        return {
                            id: producto.id,
                            nombre: match ? match[1] : 'Desconocida',
                            producto_id: producto.id,
                            producto_nombre: producto.nombre,
                            descripcion_original: producto.descripcion.replace(/\[Categoría sugerida: [^\]]+\] /, '')
                        };
                    });
                setCategoriasSugeridas(sugeridas);
            } else {
                console.error('La respuesta de listarCategoriasSugeridas no es un array:', productos);
                setError('Error al cargar categorías sugeridas: formato de respuesta incorrecto');
            }
        } catch (error) {
            console.error('Error al cargar categorías sugeridas:', error);
            setError('Error al cargar categorías sugeridas: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const crearCategoria = async (e) => {
        e.preventDefault();
        try {
            setCargando(true);
            setError(null);
            setExito('');

            // Validar datos
            if (!nuevaCategoria.nombre.trim()) {
                setError('El nombre de la categoría es obligatorio');
                return;
            }

            // Preparar datos para enviar
            const datos = {
                nombre: nuevaCategoria.nombre.trim(),
                descripcion: nuevaCategoria.descripcion.trim(),
                parent_id: nuevaCategoria.parent_id ? parseInt(nuevaCategoria.parent_id) : null
            };

            // Enviar solicitud al servidor
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/categorias/crear.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            const datosRespuesta = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(datosRespuesta.error || 'Error al crear la categoría');
            }

            // Mostrar mensaje de éxito
            setExito('Categoría creada correctamente');

            // Limpiar formulario
            setNuevaCategoria({
                nombre: '',
                descripcion: '',
                parent_id: ''
            });

            // Recargar categorías
            cargarCategorias();
        } catch (error) {
            setError('Error al crear la categoría: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const aprobarCategoriaSugerida = async (categoriaSugerida) => {
        try {
            setCargando(true);
            setError(null);
            
            // 1. Crear la nueva categoría
            const datosCategoria = {
                nombre: categoriaSugerida.nombre.trim(),
                descripcion: `Categoría sugerida desde producto ID: ${categoriaSugerida.producto_id}`,
                parent_id: null
            };
            
            const respuestaCategoria = await fetch(
                `${import.meta.env.VITE_API_URL}/categorias/crear.php`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosCategoria)
                }
            );
            
            const datosRespuestaCategoria = await respuestaCategoria.json();
            
            if (!respuestaCategoria.ok) {
                throw new Error(datosRespuestaCategoria.error || 'Error al crear la categoría');
            }
            
            // 2. Actualizar el producto con la nueva categoría y eliminar la sugerencia de la descripción
            const formData = new FormData();
            formData.append('producto_id', categoriaSugerida.producto_id);
            formData.append('categoria_id', datosRespuestaCategoria.categoria.id);
            formData.append('descripcion', categoriaSugerida.descripcion_original);
            
            const respuestaActualizar = await fetch(
                `${import.meta.env.VITE_API_URL}/productos/actualizar.php`, 
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            const datosRespuestaActualizar = await respuestaActualizar.json();
            
            if (!respuestaActualizar.ok) {
                throw new Error(datosRespuestaActualizar.error || 'Error al actualizar el producto');
            }
            
            // 3. Actualizar la interfaz
            setExito(`Categoría "${categoriaSugerida.nombre}" aprobada y asignada al producto`);
            setCategoriasSugeridas(prev => prev.filter(cat => cat.id !== categoriaSugerida.id));
            cargarCategorias();
        } catch (error) {
            setError('Error al aprobar la categoría: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    const rechazarCategoriaSugerida = async (categoriaSugerida) => {
        try {
            setCargando(true);
            setError(null);
            
            // Actualizar el producto para eliminar la sugerencia de la descripción
            const formData = new FormData();
            formData.append('producto_id', categoriaSugerida.producto_id);
            formData.append('descripcion', categoriaSugerida.descripcion_original);
            
            const respuesta = await fetch(
                `${import.meta.env.VITE_API_URL}/productos/actualizar.php`, 
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            const datosRespuesta = await respuesta.json();
            
            if (!respuesta.ok) {
                throw new Error(datosRespuesta.error || 'Error al actualizar el producto');
            }
            
            // Actualizar la interfaz
            setExito(`Categoría "${categoriaSugerida.nombre}" rechazada`);
            setCategoriasSugeridas(prev => prev.filter(cat => cat.id !== categoriaSugerida.id));
        } catch (error) {
            setError('Error al rechazar la categoría: ' + error.message);
        } finally {
            setCargando(false);
        }
    };

    // Función para aplanar la estructura de categorías para el select
    const aplanarCategorias = (cats, nivel = 0) => {
        let resultado = [];
        cats.forEach(cat => {
            // Añadir la categoría actual con su nivel
            resultado.push({ ...cat, nivel });
            // Añadir subcategorías si existen
            if (cat.subcategorias && cat.subcategorias.length > 0) {
                resultado = [...resultado, ...aplanarCategorias(cat.subcategorias, nivel + 1)];
            }
        });
        return resultado;
    };

    // Obtener categorías aplanadas para el select
    const categoriasPlanificadas = aplanarCategorias(categorias);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Administración de Categorías</h2>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            {exito && (
                <div className="alert alert-success" role="alert">
                    {exito}
                </div>
            )}
            
            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Crear Nueva Categoría</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={crearCategoria}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre de la Categoría</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="nombre" 
                                        name="nombre"
                                        value={nuevaCategoria.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                                    <textarea 
                                        className="form-control" 
                                        id="descripcion" 
                                        name="descripcion"
                                        value={nuevaCategoria.descripcion}
                                        onChange={handleInputChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="parent_id" className="form-label">Categoría Padre (opcional)</label>
                                    <select 
                                        className="form-select" 
                                        id="parent_id" 
                                        name="parent_id"
                                        value={nuevaCategoria.parent_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Ninguna (categoría principal)</option>
                                        {categoriasPlanificadas.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nivel > 0 ? '- '.repeat(cat.nivel) : ''}{cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={cargando}
                                >
                                    {cargando ? 'Creando...' : 'Crear Categoría'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">Categorías Sugeridas por Usuarios</h5>
                        </div>
                        <div className="card-body">
                            {categoriasSugeridas.length > 0 ? (
                                <div className="list-group">
                                    {categoriasSugeridas.map((cat) => (
                                        <div key={cat.id} className="list-group-item list-group-item-action flex-column align-items-start">
                                            <div className="d-flex w-100 justify-content-between mb-2">
                                                <h5 className="mb-1">{cat.nombre}</h5>
                                            </div>
                                            <p className="mb-1">Producto: {cat.producto_nombre}</p>
                                            <div className="d-flex justify-content-end mt-2">
                                                <button 
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={() => aprobarCategoriaSugerida(cat)}
                                                    disabled={cargando}
                                                >
                                                    Aprobar
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => rechazarCategoriaSugerida(cat)}
                                                    disabled={cargando}
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center">No hay categorías sugeridas pendientes de revisión.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="card mt-4">
                <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0">Categorías Existentes</h5>
                </div>
                <div className="card-body">
                    {cargando ? (
                        <p className="text-center">Cargando categorías...</p>
                    ) : (
                        categorias.length > 0 ? (
                            <ul className="list-group">
                                {categoriasPlanificadas.map(cat => (
                                    <li key={cat.id} className="list-group-item">
                                        {cat.nivel > 0 ? '- '.repeat(cat.nivel) : ''}{cat.nombre}
                                        {cat.descripcion && <small className="text-muted d-block">{cat.descripcion}</small>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center">No hay categorías disponibles.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminCategoriasForm;