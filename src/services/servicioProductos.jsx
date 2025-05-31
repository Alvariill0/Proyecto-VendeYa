const BASE_URL = import.meta.env.VITE_API_URL;

export async function listarCategorias() {
    try {
        const respuesta = await fetch(`${BASE_URL}/categorias/listar.php`);
        
        // Verificar si la respuesta es exitosa
        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            let errorMessage = 'Error al obtener categorías';
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                console.error('Error al parsear respuesta de error:', errorText);
                errorMessage = `${errorMessage}: ${errorText}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // Intentar parsear la respuesta como JSON
        try {
            const datos = await respuesta.json();
            return datos;
        } catch (parseError) {
            console.error('Error al parsear respuesta JSON:', parseError);
            const responseText = await respuesta.text();
            console.error('Contenido de la respuesta:', responseText);
            throw new Error(`Error al parsear la respuesta: ${parseError.message}`);
        }
    } catch (error) {
        console.error('Error en listarCategorias:', error);
        throw error;
    }
}

export async function listarProductos(categoriaId = null) {
    let url = `${BASE_URL}/productos/listar.php`;
    if (categoriaId !== null) {
        url += `?categoria_id=${categoriaId}`;
    }

    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener productos');
    }

    return datos;
}

export async function obtenerProducto(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }

    const respuesta = await fetch(`${BASE_URL}/productos/obtener.php?id=${productoId}`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener el producto');
    }

    return datos;
}

export async function crearProducto(formData) {
    const url = `${BASE_URL}/productos/crear.php`;
    
    // TODO: En una aplicación real, la identificación del usuario debería manejarse de forma segura (ej. sesiones, tokens).
    // No se debería confiar en un user_id enviado directamente desde el frontend para operaciones sensibles.

    const respuesta = await fetch(url, {
        method: 'POST',
        body: formData // FormData maneja correctamente los datos del formulario y la imagen
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        // Si la respuesta no es OK (ej. 400, 500), lanzamos un error con el mensaje del backend si existe
        throw new Error(datos.error || 'Error en la respuesta del servidor al crear producto.');
    }

    // Si la respuesta es OK (ej. 201 Created), devolvemos los datos (ej. mensaje de éxito, ID del producto)
    return datos;
}

export async function actualizarProducto(productoId, formData) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }

    // Asegurarse de que el ID del producto esté en el formData
    formData.append('producto_id', productoId);

    const respuesta = await fetch(`${BASE_URL}/productos/actualizar.php`, {
        method: 'POST', // Usamos POST para compatibilidad con FormData
        body: formData
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al actualizar el producto');
    }

    return datos;
}

export async function eliminarProducto(productoId) {
    if (!productoId) {
        throw new Error('Se requiere un ID de producto válido');
    }

    const respuesta = await fetch(`${BASE_URL}/productos/eliminar.php?id=${productoId}`, {
        method: 'DELETE'
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al eliminar el producto');
    }

    return datos;
}

export async function listarProductosVendedor(vendedorId) {
    if (!vendedorId) {
        throw new Error('Se requiere un ID de vendedor válido');
    }

    const respuesta = await fetch(`${BASE_URL}/productos/listar.php?vendedor_id=${vendedorId}`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al obtener productos del vendedor');
    }

    return datos;
}

export async function listarProductosConCategoriasSugeridas() {
    try {
        const respuesta = await fetch(`${BASE_URL}/productos/listar.php?categorias_sugeridas=true`);
        
        // Verificar si la respuesta es exitosa
        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            let errorMessage = 'Error al obtener productos con categorías sugeridas';
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                console.error('Error al parsear respuesta de error:', errorText);
                errorMessage = `${errorMessage}: ${errorText}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // Intentar parsear la respuesta como JSON
        try {
            const datos = await respuesta.json();
            return datos;
        } catch (parseError) {
            console.error('Error al parsear respuesta JSON:', parseError);
            const responseText = await respuesta.text();
            console.error('Contenido de la respuesta:', responseText);
            throw new Error(`Error al parsear la respuesta: ${parseError.message}`);
        }
    } catch (error) {
        console.error('Error en listarProductosConCategoriasSugeridas:', error);
        throw error;
    }
}