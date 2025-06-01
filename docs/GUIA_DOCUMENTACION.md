# Guía de Documentación para VendeYa

Este documento proporciona directrices para documentar el código en el proyecto VendeYa, tanto para el frontend (JavaScript/React) como para el backend (PHP).

## Configuración de Herramientas

### JSDoc (JavaScript/React)

Hemos configurado JSDoc para generar documentación automática para el código JavaScript y React:

```bash
# Instalar JSDoc y tema
npm install --save-dev jsdoc clean-jsdoc-theme

# Generar documentación
npm run docs:js
```

La documentación generada se encuentra en `docs/js/`.

### PHPDocumentor (PHP)

Para el código PHP, utilizamos PHPDocumentor:

```bash
# Instalar PHPDocumentor (requiere Composer)
composer require --dev phpdocumentor/phpdocumentor

# Generar documentación
./vendor/bin/phpdoc -c phpdoc.dist.xml
```

La documentación generada se encuentra en `docs/php/`.

## Estándares de Documentación

### JavaScript/React

#### Hooks Personalizados

```javascript
/**
 * Hook personalizado para gestionar mensajes entre usuarios.
 * 
 * @param {Object} opciones - Opciones de configuración
 * @param {boolean} [opciones.cargarInicial=true] - Si debe cargar conversaciones al iniciar
 * @returns {Object} Funciones y estado para gestionar mensajes
 * @returns {Array} .conversaciones - Lista de conversaciones del usuario
 * @returns {Function} .cargarConversaciones - Función para obtener conversaciones
 * @returns {Function} .enviarMensaje - Función para enviar un nuevo mensaje
 * @returns {boolean} .cargando - Estado de carga de datos
 * @returns {string|null} .error - Mensaje de error si existe
 */
function useMensajes({ cargarInicial = true } = {}) {
  // Implementación...
}
```

#### Componentes React

```jsx
/**
 * Componente que muestra el estado de un pedido con un indicador visual.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.estado - Estado actual del pedido (pendiente, enviado, entregado, cancelado)
 * @param {string} [props.className] - Clases CSS adicionales
 * @returns {JSX.Element} Componente de estado con indicador visual
 */
function EstadoPedido({ estado, className }) {
  // Implementación...
}
```

#### Servicios

```javascript
/**
 * Servicio para gestionar operaciones relacionadas con pedidos.
 * @module servicioPedidos
 */

/**
 * Obtiene la lista de pedidos del usuario actual.
 * 
 * @async
 * @function listarPedidos
 * @returns {Promise<Array>} Lista de pedidos del usuario
 * @throws {Error} Si ocurre un error en la petición
 */
export const listarPedidos = async () => {
  // Implementación...
};
```

### PHP

#### Endpoints API

```php
<?php
/**
 * Endpoint para listar valoraciones de un producto.
 * 
 * @api
 * @method GET
 * @param int $_GET['id_producto'] ID del producto para obtener valoraciones
 * @return array Lista de valoraciones con información de usuarios
 */

// Implementación...
```

#### Funciones de Utilidad

```php
<?php
/**
 * Verifica si un usuario está autenticado mediante el token JWT.
 * 
 * @param string|null $token Token JWT de autenticación (opcional)
 * @return array Información del usuario si está autenticado
 * @throws Exception Si el token es inválido o ha expirado
 */
function verificarAutenticacion($token = null) {
  // Implementación...
}
```

## Ejemplos Prácticos

### Documentación de un Hook (JavaScript)

Ejemplo completo para `useMensajes.js`:

```javascript
/**
 * Hook personalizado para gestionar mensajes entre usuarios.
 * Proporciona funcionalidades para cargar conversaciones, enviar mensajes,
 * marcar mensajes como leídos y buscar usuarios para iniciar conversaciones.
 * 
 * @param {Object} opciones - Opciones de configuración
 * @param {boolean} [opciones.cargarInicial=true] - Si debe cargar conversaciones al iniciar
 * @returns {Object} Funciones y estado para gestionar mensajes
 */
function useMensajes({ cargarInicial = true } = {}) {
  // Estado para almacenar las conversaciones
  const [conversaciones, setConversaciones] = useState([]);
  // Estado para almacenar los mensajes de la conversación actual
  const [mensajes, setMensajes] = useState([]);
  // Estado para almacenar la conversación actual
  const [conversacionActual, setConversacionActual] = useState(null);
  // Estado para almacenar el usuario actual
  const [usuarioActual, setUsuarioActual] = useState(null);
  // Estado para almacenar los mensajes no leídos
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  // Estados de carga y error
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  // Estados para búsqueda de usuarios
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);

  /**
   * Carga la lista de conversaciones del usuario.
   * 
   * @async
   * @function cargarConversaciones
   * @returns {Promise<Array>} Lista de conversaciones
   */
  const cargarConversaciones = useCallback(async () => {
    if (!usuarioActual) return;
    
    setCargando(true);
    setError(null);
    
    try {
      const data = await listarConversaciones();
      setConversaciones(data);
      return data;
    } catch (err) {
      setError('Error al cargar conversaciones: ' + err.message);
      toast.error('Error al cargar conversaciones');
    } finally {
      setCargando(false);
    }
  }, [usuarioActual]);

  // Resto de la implementación...

  return {
    conversaciones,
    mensajes,
    conversacionActual,
    cargando,
    error,
    cargarConversaciones,
    // Resto de funciones y estado...
  };
}
```

### Documentación de un Endpoint API (PHP)

Ejemplo completo para `api/valoraciones/listar.php`:

```php
<?php
/**
 * Endpoint para listar valoraciones de un producto.
 * 
 * Este endpoint devuelve todas las valoraciones asociadas a un producto específico,
 * incluyendo información del usuario que realizó cada valoración.
 * 
 * @api
 * @method GET
 * @param int $_GET['id_producto'] ID del producto para obtener valoraciones
 * @return array Lista de valoraciones con información de usuarios
 */

// Incluir configuración de base de datos
require_once '../config/database.php';

// Configurar cabeceras para JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Verificar método de solicitud
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Método no permitido
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Verificar parámetro requerido
if (!isset($_GET['id_producto'])) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['error' => 'Se requiere el ID del producto']);
    exit;
}

$idProducto = intval($_GET['id_producto']);

try {
    // Obtener conexión a la base de datos
    $conexion = obtenerConexion();
    
    // Consulta SQL para obtener valoraciones con información de usuarios
    $consulta = "SELECT v.*, u.nombre, u.apellido 
                FROM valoraciones v 
                JOIN usuarios u ON v.id_usuario = u.id 
                WHERE v.id_producto = ? 
                ORDER BY v.fecha DESC";
    
    $stmt = $conexion->prepare($consulta);
    $stmt->bind_param('i', $idProducto);
    $stmt->execute();
    
    $resultado = $stmt->get_result();
    $valoraciones = [];
    
    while ($fila = $resultado->fetch_assoc()) {
        $valoraciones[] = $fila;
    }
    
    // Devolver resultados
    echo json_encode($valoraciones);
    
} catch (Exception $e) {
    http_response_code(500); // Error del servidor
    echo json_encode(['error' => 'Error al obtener valoraciones: ' . $e->getMessage()]);
}
```

## Mejores Prácticas

1. **Documenta mientras desarrollas**: Es más fácil documentar el código mientras lo escribes que hacerlo después.

2. **Sé consistente**: Utiliza el mismo estilo de documentación en todo el proyecto.

3. **Documenta el qué, no el cómo**: Explica qué hace una función, no cómo lo hace (a menos que sea complejo).

4. **Incluye ejemplos**: Cuando sea posible, incluye ejemplos de uso.

5. **Mantén actualizada la documentación**: Actualiza la documentación cuando cambies el código.

6. **Genera documentación regularmente**: Ejecuta los comandos de generación de documentación antes de cada release.

## Recursos Adicionales

- [Documentación oficial de JSDoc](https://jsdoc.app/)
- [Documentación oficial de PHPDocumentor](https://docs.phpdoc.org/)
- [Guía de estilo de documentación para JavaScript](https://google.github.io/styleguide/jsguide.html#jsdoc)
- [Guía de estilo de documentación para PHP](https://www.php-fig.org/psr/psr-5/)