import React, { useState, useEffect } from 'react';
import { crearProducto } from '../../../services/servicioProductos';
import { listarCategorias } from '../../../services/servicioCategorias';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useNavigate } from 'react-router-dom';

function CrearProductoForm() {
    const { usuario } = useAutenticacion();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('');
    const [mostrarCategoriaPersonalizada, setMostrarCategoriaPersonalizada] = useState(false);
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

        // Validaciones básicas
        if (!nombre.trim()) {
            setErrorCreacion('El nombre del producto es obligatorio');
            return;
        }

        if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
            setErrorCreacion('El precio debe ser un número mayor que cero');
            return;
        }

        if (!categoriaId) {
            setErrorCreacion('Debes seleccionar una categoría');
            return;
        }

        // Validar categoría personalizada si se seleccionó "otro"
        if (categoriaId === 'otro' && !categoriaPersonalizada.trim()) {
            setErrorCreacion('Debes ingresar una categoría personalizada');
            return;
        }

        if (!stock || isNaN(stock) || parseInt(stock) < 0 || !Number.isInteger(parseFloat(stock))) {
            setErrorCreacion('El stock debe ser un número entero no negativo');
            return;
        }

        try {
            setCargandoCreacion(true);
            setErrorCreacion(null);
            setMensajeExito('');

            // Crear un objeto FormData para enviar los datos, incluyendo la imagen
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('descripcion', descripcion);
            formData.append('precio', precio);
            
            // Si se seleccionó "otro", enviar la categoría personalizada
            if (categoriaId === 'otro') {
                formData.append('categoria_id', 'otro');
                formData.append('categoria_personalizada', categoriaPersonalizada);
            } else {
                formData.append('categoria_id', categoriaId);
            }
            
            formData.append('stock', stock);

            // Añadir la imagen si se seleccionó una
            if (imagen) {
                formData.append('imagen', imagen);
            }

            // Enviar los datos al servidor
            const respuesta = await crearProducto(formData);

            // Mostrar mensaje de éxito
            setMensajeExito('Producto creado correctamente');

            // Limpiar el formulario
            setNombre('');
            setDescripcion('');
            setPrecio('');
            setCategoriaId('');
            setCategoriaPersonalizada('');
            setMostrarCategoriaPersonalizada(false);
            setStock('');
            setImagen(null);

            // Redirigir al panel de usuario después de un breve retraso
            setTimeout(() => {
                navigate('/panel-usuario');
            }, 2000);
        } catch (error) {
            console.error('Error al crear producto:', error);
            setErrorCreacion('Error al crear el producto. Por favor, intenta de nuevo.');
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
                                onChange={(e) => {
                                    setCategoriaId(e.target.value);
                                    setMostrarCategoriaPersonalizada(e.target.value === 'otro');
                                }}
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
                                <option value="otro">Otro (especificar)</option>
                            </select>
                        </div>
                        
                        {mostrarCategoriaPersonalizada && (
                            <div className="mb-3">
                                <label htmlFor="categoriaPersonalizada" className="form-label">Especifica la categoría</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="categoriaPersonalizada"
                                    value={categoriaPersonalizada}
                                    onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                                    placeholder="Escribe el nombre de la categoría"
                                    required
                                />
                                <div className="form-text">Esta categoría será revisada por un administrador.</div>
                            </div>
                        )}
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