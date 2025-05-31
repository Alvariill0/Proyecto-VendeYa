import React, { useState } from 'react';
import { useAutenticacion } from '../../context/ContextoAutenticacion';
import { useValoraciones } from '../../hooks/useValoraciones';
import { FaStar, FaStarHalfAlt, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * Componente para mostrar y gestionar las valoraciones de un producto
 * @param {Object} props - Propiedades del componente
 * @param {number} props.productoId - ID del producto
 * @returns {JSX.Element} Componente de valoraciones
 */
const ValoracionesProducto = ({ productoId }) => {
    const { usuario } = useAutenticacion();
    const { 
        valoraciones, 
        estadisticas, 
        cargando, 
        error, 
        puedeValorar, 
        valoracionUsuario,
        crear,
        actualizar,
        eliminar
    } = useValoraciones(productoId);
    
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaValoracion, setNuevaValoracion] = useState({
        puntuacion: valoracionUsuario?.puntuacion || 5,
        comentario: valoracionUsuario?.comentario || ''
    });
    
    // Actualizar el formulario cuando cambia la valoración del usuario
    React.useEffect(() => {
        if (valoracionUsuario) {
            setNuevaValoracion({
                puntuacion: valoracionUsuario.puntuacion,
                comentario: valoracionUsuario.comentario || ''
            });
        }
    }, [valoracionUsuario]);

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaValoracion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Establecer puntuación
    const handleSetPuntuacion = (valor) => {
        setNuevaValoracion(prev => ({
            ...prev,
            puntuacion: valor
        }));
    };

    // Enviar valoración (crear o actualizar)
    const handleSubmitValoracion = async (e) => {
        e.preventDefault();
        
        if (!nuevaValoracion.puntuacion) {
            toast.error('Debes seleccionar una puntuación');
            return;
        }
        
        let resultado;
        
        if (valoracionUsuario) {
            // Actualizar valoración existente
            resultado = await actualizar(nuevaValoracion);
        } else {
            // Crear nueva valoración
            resultado = await crear(nuevaValoracion);
        }
        
        if (resultado) {
            // Ocultar formulario
            setMostrarFormulario(false);
        }
    };

    // Eliminar valoración
    const handleEliminarValoracion = async () => {
        if (!valoracionUsuario) return;
        
        if (!window.confirm('¿Estás seguro de que deseas eliminar tu valoración?')) {
            return;
        }
        
        const resultado = await eliminar();
        
        if (resultado) {
            // Resetear formulario
            setNuevaValoracion({ puntuacion: 5, comentario: '' });
        }
    };

    // Renderizar estrellas para una puntuación
    const renderEstrellas = (puntuacion) => {
        const estrellas = [];
        const puntuacionRedondeada = Math.round(puntuacion * 2) / 2; // Redondear a 0.5
        
        for (let i = 1; i <= 5; i++) {
            if (i <= puntuacionRedondeada) {
                estrellas.push(<FaStar key={i} className="text-yellow-500" />);
            } else if (i - 0.5 === puntuacionRedondeada) {
                estrellas.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
            } else {
                estrellas.push(<FaRegStar key={i} className="text-yellow-500" />);
            }
        }
        
        return estrellas;
    };

    // Renderizar estrellas seleccionables para el formulario
    const renderEstrellasSeleccionables = () => {
        const estrellas = [];
        
        for (let i = 1; i <= 5; i++) {
            estrellas.push(
                <button 
                    key={i} 
                    type="button"
                    onClick={() => handleSetPuntuacion(i)}
                    className="text-2xl focus:outline-none"
                >
                    {i <= nuevaValoracion.puntuacion ? (
                        <FaStar className="text-yellow-500" />
                    ) : (
                        <FaRegStar className="text-yellow-500" />
                    )}
                </button>
            );
        }
        
        return estrellas;
    };

    if (cargando) {
        return <div className="p-4 text-center">Cargando valoraciones...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">Valoraciones y Opiniones</h2>
            
            {/* Resumen de valoraciones */}
            <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                    {renderEstrellas(estadisticas.promedio)}
                    <span className="ml-2 font-bold">{estadisticas.promedio}</span>
                </div>
                <span className="text-gray-600">({estadisticas.total} {estadisticas.total === 1 ? 'valoración' : 'valoraciones'})</span>
            </div>
            
            {/* Formulario para valorar o botón para mostrarlo */}
            {usuario ? (
                valoracionUsuario ? (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Tu valoración</h3>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <FaEdit />
                                </button>
                                <button 
                                    onClick={handleEliminarValoracion}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center mb-2">
                            {renderEstrellas(valoracionUsuario.puntuacion)}
                            <span className="ml-2">{valoracionUsuario.fecha_formateada}</span>
                        </div>
                        {valoracionUsuario.comentario && (
                            <p className="text-gray-700">{valoracionUsuario.comentario}</p>
                        )}
                        
                        {mostrarFormulario && (
                            <form onSubmit={handleSubmitValoracion} className="mt-4">
                                <div className="mb-4">
                                    <label className="block mb-2">Puntuación:</label>
                                    <div className="flex">
                                        {renderEstrellasSeleccionables()}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="comentario" className="block mb-2">Comentario (opcional):</label>
                                    <textarea
                                        id="comentario"
                                        name="comentario"
                                        value={nuevaValoracion.comentario}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                    ></textarea>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setMostrarFormulario(false)}
                                        className="px-4 py-2 border rounded hover:bg-gray-100"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Actualizar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : puedeValorar ? (
                    mostrarFormulario ? (
                        <form onSubmit={handleSubmitValoracion} className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold mb-4">Valora este producto</h3>
                            <div className="mb-4">
                                <label className="block mb-2">Puntuación:</label>
                                <div className="flex">
                                    {renderEstrellasSeleccionables()}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="comentario" className="block mb-2">Comentario (opcional):</label>
                                <textarea
                                    id="comentario"
                                    name="comentario"
                                    value={nuevaValoracion.comentario}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    placeholder="Comparte tu experiencia con este producto..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button 
                                    type="button" 
                                    onClick={() => setMostrarFormulario(false)}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Enviar
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button 
                            onClick={() => setMostrarFormulario(true)}
                            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Valorar este producto
                        </button>
                    )
                ) : (
                    <p className="mb-6 text-gray-600 italic">
                        Solo los clientes que han comprado este producto pueden valorarlo.
                    </p>
                )
            ) : (
                <p className="mb-6 text-gray-600 italic">
                    Inicia sesión para valorar este producto.
                </p>
            )}
            
            {/* Lista de valoraciones */}
            {valoraciones.length > 0 ? (
                <div className="space-y-4">
                    {valoraciones
                        .filter(v => !valoracionUsuario || v.id !== valoracionUsuario.id) // No mostrar la valoración del usuario actual aquí
                        .map(valoracion => (
                            <div key={valoracion.id} className="border-b pb-4">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{valoracion.usuario_nombre}</span>
                                    <span className="text-gray-500 text-sm">{valoracion.fecha_formateada}</span>
                                </div>
                                <div className="flex items-center my-1">
                                    {renderEstrellas(valoracion.puntuacion)}
                                </div>
                                {valoracion.comentario && (
                                    <p className="mt-2 text-gray-700">{valoracion.comentario}</p>
                                )}
                            </div>
                        ))
                    }
                </div>
            ) : (
                <p className="text-gray-600 italic">
                    Este producto aún no tiene valoraciones.
                </p>
            )}
        </div>
    );
};

export default ValoracionesProducto;