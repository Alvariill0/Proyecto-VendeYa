import React, { useState, useEffect } from 'react';
import { listarCategorias, crearProducto } from '../../../services/servicioProductos';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useNavigate } from 'react-router-dom';

function CrearProductoForm() {
    const { usuario } = useAutenticacion();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [imagen, setImagen] = useState(null); // Para manejar la subida de archivos
    const [stock, setStock] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [errorCategorias, setErrorCategorias] = useState(null);
    const [cargandoCreacion, setCargandoCreacion] = useState(false);
    const [errorCreacion, setErrorCreacion] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');


    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                setCargandoCategorias(true);
                const cats = await listarCategorias();
                setCategorias(cats);
            } catch (error) {
                setErrorCategorias(error.message);
            } finally {
                setCargandoCategorias(false);
            }
        };
        obtenerCategorias();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!nombre || !descripcion || !precio || !categoriaId || !stock) {
            setErrorCreacion('Por favor, complete todos los campos requeridos.');
            return;
        }
        if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
             setErrorCreacion('El precio debe ser un número positivo.');
            return;
        }
         if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
             setErrorCreacion('El stock debe ser un número entero no negativo.');
            return;
        }

        // Creamos un FormData para enviar datos y archivo (imagen)
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', precio);
        formData.append('categoria_id', categoriaId);
        formData.append('stock', stock);
        if (imagen) {
            formData.append('imagen', imagen); // Añadir el archivo de imagen si existe
        }
        // Asumimos que el vendedor_id se obtiene del usuario autenticado en el backend por seguridad
        // formData.append('vendedor_id', usuario.id); // Esto se pasará en el header o sesión en una implementación real

        try {
            setCargandoCreacion(true);
            setErrorCreacion(null);
            setMensajeExito('');
            
            const resultado = await crearProducto(formData); // Usamos la nueva función de servicio

            setMensajeExito(resultado.mensaje || 'Producto creado con éxito!');
            // Opcional: limpiar formulario o redirigir
             setNombre('');
             setDescripcion('');
             setPrecio('');
             setCategoriaId('');
             setImagen(null);
             setStock('');
             // O quizás redirigir a la página del producto o al panel del vendedor
             // navigate('/perfil/mis-productos');

        } catch (error) {
            setErrorCreacion(error.message || 'Error al crear el producto.');
        } finally {
            setCargandoCreacion(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <h2 className="mb-4 text-center">Crear Nuevo Producto</h2>

                {errorCategorias && (
                    <div className="alert alert-danger" role="alert">
                        Error al cargar categorías: {errorCategorias}
                    </div>
                )}

                {mensajeExito && (
                    <div className="alert alert-success" role="alert">
                        {mensajeExito}
                    </div>
                )}

                {errorCreacion && (
                    <div className="alert alert-danger" role="alert">
                        {errorCreacion}
                    </div>
                )}

                {!cargandoCategorias ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="nombreProducto" className="form-label">Nombre del Producto</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nombreProducto"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="descripcionProducto" className="form-label">Descripción</label>
                            <textarea
                                className="form-control"
                                id="descripcionProducto"
                                rows="3"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="precioProducto" className="form-label">Precio (€)</label>
                            <input
                                type="number"
                                className="form-control"
                                id="precioProducto"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stockProducto" className="form-label">Stock</label>
                            <input
                                type="number"
                                className="form-control"
                                id="stockProducto"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                required
                                min="0"
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="categoriaProducto" className="form-label">Categoría</label>
                            <select
                                className="form-select"
                                id="categoriaProducto"
                                value={categoriaId}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                required
                                disabled={cargandoCategorias} // Deshabilitar si las categorías aún están cargando
                            >
                                <option value="">Selecciona una categoría</option>
                                {/* Aplanar la estructura de categorías para el select */}
                                {categorias.flatMap(cat => [
                                    // Opción para la categoría principal
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>,
                                    // Opciones para subcategorías
                                    ...(cat.subcategorias ? cat.subcategorias.map(subCat => (
                                        <option key={subCat.id} value={subCat.id}>-- {subCat.nombre}</option>
                                    )) : [])
                                ])}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="imagenProducto" className="form-label">Imagen del Producto</label>
                            <input
                                type="file"
                                className="form-control"
                                id="imagenProducto"
                                accept="image/*" // Aceptar solo archivos de imagen
                                onChange={(e) => setImagen(e.target.files[0])}
                            />
                             <small className="form-text text-muted">Opcional. Tamaño máximo 2MB (ejemplo).</small>
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={cargandoCreacion}>
                            {cargandoCreacion ? 'Creando...' : 'Crear Producto'}
                        </button>
                    </form>
                ) : (
                     <p className="text-center">Cargando formulario...</p>
                )}
            </div>
        </div>
    );
}

export default CrearProductoForm; 