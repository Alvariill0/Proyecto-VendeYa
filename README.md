# VendeYa - Plataforma de Marketplace Online

<p align="center">
  <img src="./src/assets/VendeYa_Logo.png" alt="VendeYa Logo" width="200">
</p>

## 📋 Descripción

VendeYa es una plataforma de marketplace online desarrollada con React y PHP que permite a los usuarios registrarse como compradores o vendedores, publicar productos, gestionar pedidos y realizar compras. La aplicación ofrece una experiencia completa de e-commerce con funcionalidades como carrito de compras, sistema de mensajería, valoraciones de productos y panel de administración.

## ✨ Características Principales

- **Sistema de Autenticación**: Registro y login de usuarios con roles diferenciados (usuario, administrador).
- **Gestión de Productos**: Crear, editar, eliminar y listar productos con categorías.
- **Carrito de Compras**: Añadir productos, actualizar cantidades y realizar pedidos.
- **Panel de Usuario**: Personalizado según el rol del usuario.
- **Sistema de Mensajería**: Comunicación entre compradores y vendedores.
- **Valoraciones y Comentarios**: Posibilidad de valorar productos tras la compra.
- **Estadísticas para Vendedores**: Visualización de ventas, productos más vendidos y valoraciones.
- **Buscador con Filtros**: Búsqueda por categoría, precio, nombre, etc.
- **Tema Claro/Oscuro**: Interfaz adaptable con soporte para modo oscuro.

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 19
- React Router 7
- Bootstrap 5
- React Bootstrap
- React Icons
- React Toastify
- ApexCharts (para gráficos estadísticos)

### Backend
- PHP
- MySQL

### Herramientas de Desarrollo
- Vite
- ESLint
- Git/GitHub

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PHP 8.0 o superior
- MySQL 8.0 o superior
- XAMPP (para entorno de desarrollo local)

## 🚀 Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/vendeya.git
   cd vendeya
   ```

2. Instala las dependencias del frontend:
   ```bash
   npm install
   ```

3. Instala las dependencias de PHP (necesarias para las pruebas del backend):
   ```bash
   composer install
   ```
   > Nota: El directorio `vendor` generado solo es necesario para ejecutar las pruebas del backend.

4. Configura la base de datos:
   - Inicia XAMPP y asegúrate de que los servicios Apache y MySQL estén funcionando.
   - Crea una base de datos llamada `vendeya` en phpMyAdmin.
   - Importa el archivo `sql/database_setup.sql` para crear las tablas necesarias.

5. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example` (si existe).
   - Configura las credenciales de la base de datos y otras variables necesarias.

## 🖥️ Uso

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre tu navegador y visita `http://localhost:5173` (o el puerto que indique la consola).

3. Para construir la versión de producción:
   ```bash
   npm run build
   ```

## 🚀 Despliegue

Para desplegar la aplicación en un servidor de producción:

1. Construye la versión de producción del frontend:
   ```bash
   npm run build
   ```

2. Copia todos los archivos generados en la carpeta `dist` al directorio raíz de tu servidor web.

3. Copia la carpeta `api` completa al directorio raíz de tu servidor web.

4. Configura la base de datos en el servidor:
   - Crea una base de datos para la aplicación.
   - Importa el archivo `sql/database_setup.sql`.
   - Actualiza el archivo `api/config/database.php` con las credenciales correctas.

5. Asegúrate de que el servidor web tenga los permisos adecuados para acceder a los archivos y directorios.

## 📁 Estructura del Proyecto

```
├── api/                           # Backend en PHP
│   ├── auth/                      # Endpoints de autenticación
│   ├── carrito/                   # Endpoints del carrito
│   ├── categorias/                # Endpoints de categorías
│   ├── config/                    # Configuración de la BD
│   ├── mensajes/                  # Sistema de mensajería
│   ├── pedidos/                   # Gestión de pedidos
│   ├── productos/                 # Gestión de productos
│   └── valoraciones/              # Sistema de valoraciones
├── src/                           # Código fuente (React)
│   ├── assets/                    # Recursos estáticos
│   ├── components/                # Componentes React
│   │   ├── common/                # Componentes genéricos
│   │   ├── features/              # Componentes específicos
│   │   └── layout/                # Componentes de estructura
│   ├── context/                   # Contextos de React
│   ├── hooks/                     # Hooks personalizados
│   ├── pages/                     # Páginas principales
│   └── services/                  # Servicios para API
└── public/                        # Archivos públicos
```

## 🧪 Testing

### Pruebas Frontend

Ejecuta las pruebas del frontend con el siguiente comando:

```bash
npm run test
```

### Pruebas Backend

Para ejecutar las pruebas del backend, asegúrate de tener instalado PHPUnit a través de Composer y ejecuta:

```bash
./vendor/bin/phpunit tests/backend
```

> Nota: Asegúrate de que XAMPP esté en funcionamiento con Apache y MySQL activos para las pruebas del backend.

## 🤝 Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [Tu Usuario de GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Agradecimientos a todos los que han contribuido al proyecto
- Inspirado en otras plataformas de marketplace como Wallapop y Milanuncios
