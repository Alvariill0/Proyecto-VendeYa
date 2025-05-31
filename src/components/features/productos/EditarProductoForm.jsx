import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerProducto, actualizarProducto } from '../../../services/servicioProductos';
import { listarCategorias } from '../../../services/servicioCategorias';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';

function EditarProductoForm() {
    const { id } = useParams();
    const { usuario } = useAutenticacion();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('');
    const [mostrarCategoriaPersonalizada, setMostrarCategoriaPersonalizada] = useState(false);
    const [stock, setStock] = useState('');
    const [imagen, setImagen] = useState(null); // Para manejar la subida de archivos
    const [imagenPreview, setImagenPreview] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!usuario) {
            navigate('/login');
            return;
        }

        // Cargar categorías y datos del producto
        const cargarDatos = async () => {
            try {
                setCargando(true);
                setError(null);

                // Cargar categorías
                const categoriasObtenidas = await listarCategorias();
                setCategorias(categoriasObtenidas);

                // Cargar datos del producto
                const productoObtenido = await obtenerProducto(id);
                
                // Verificar si el usuario es el propietario del producto
                if (productoObtenido.vendedor_id !== usuario.id && usuario.rol !== 'admin') {
                    setError('No tienes permiso para editar este producto');
                    return;
                }

                // Establecer los datos del producto en el formulario
                setNombre(productoObtenido.nombre || '');
                setDescripcion(productoObtenido.descripcion || '');
                setPrecio(productoObtenido.precio || '');
                setCategoriaId(productoObtenido.categoria_id || '');
                setStock(productoObtenido.stock || '');
                setImagenPreview(productoObtenido.imagen || '');
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setError('Error al cargar los datos del producto. Por favor, intenta de nuevo.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [id, usuario, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (!nombre.trim()) {
            setError('El nombre del producto es obligatorio');
            return;
        }

        if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
            setError('El precio debe ser un número mayor que cero');
            return;
        }

        if (!stock || isNaN(stock) || parseInt(stock) < 0 || !Number.isInteger(parseFloat(stock))) {
            setError('El stock debe ser un número entero no negativo');
            return;
        }

        try {
            setEnviando(true);
            setError(null);
            setMensajeExito('');

            // Crear un objeto FormData para enviar los datos, incluyendo la imagen si se seleccionó una nueva
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
            formData.append('vendedor_id', usuario.id);

            // Solo añadir la imagen si se seleccionó una nueva
            if (imagen) {
                formData.append('imagen', imagen);
            }

            // Enviar los datos al servidor
            const respuesta = await actualizarProducto(id, formData);

            // Mostrar mensaje de éxito
            setMensajeExito('Producto actualizado correctamente');

            // Redirigir al panel de usuario después de un breve retraso
            setTimeout(() => {
                navigate('/panel-usuario');
            }, 2000);
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            setError('Error al actualizar el producto. Por favor, intenta de nuevo.');
        } finally {
            setEnviando(false);
        }
    };

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            // Crear una URL para previsualizar la imagen
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setImagenPreview(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    if (cargando) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && error === 'No tienes permiso para editar este producto') {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/panel-usuario')}
                >
                    Volver al Panel de Usuario
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Editar Producto</h2>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {mensajeExito && (
                <div className="alert alert-success" role="alert">
                    {mensajeExito}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre del Producto</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <textarea
                        className="form-control"
                        id="descripcion"
                        rows="3"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    ></textarea>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="precio" className="form-label">Precio</label>
                        <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                                type="number"
                                className="form-control"
                                id="precio"
                                step="0.01"
                                min="0"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="stock" className="form-label">Stock</label>
                        <input
                            type="number"
                            className="form-control"
                            id="stock"
                            min="0"
                            step="1"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="categoria" className="form-label">Categoría</label>
                    <select
                        className="form-select"
                        id="categoria"
                        value={categoriaId}
                        onChange={(e) => {
                            setCategoriaId(e.target.value);
                            setMostrarCategoriaPersonalizada(e.target.value === 'otro');
                        }}
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
                    <label htmlFor="imagen" className="form-label">Imagen del Producto</label>
                    {imagenPreview && (
                        <div className="mb-2">
                            <img 
                                src={imagenPreview} 
                                alt="Vista previa" 
                                style={{ maxWidth: '200px', maxHeight: '200px' }} 
                                className="img-thumbnail"
                            />
                        </div>
                    )}
                    <input
                        type="file"
                        className="form-control"
                        id="imagen"
                        accept="image/*"
                        onChange={handleImagenChange}
                    />
                    <div className="form-text">Selecciona una nueva imagen solo si deseas cambiar la actual.</div>
                </div>

                <div className="d-flex justify-content-between">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => navigate('/panel-usuario')}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={enviando}
                    >
                        {enviando ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span className="ms-2">Guardando...</span>
                            </>
                        ) : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditarProductoForm;