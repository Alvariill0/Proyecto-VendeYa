# Plantilla de Documentación para Componentes React

Utilice esta plantilla como guía para documentar componentes React en el proyecto VendeYa.

## Documentación JSDoc

```jsx
/**
 * [NOMBRE DEL COMPONENTE] - [DESCRIPCIÓN BREVE]
 * 
 * [DESCRIPCIÓN DETALLADA - Explique el propósito y funcionalidad del componente]
 * 
 * @component
 * @example
 * // Ejemplo básico de uso
 * <NombreComponente propiedad1="valor" propiedad2={valor} />
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.propiedad1 - Descripción de la propiedad1
 * @param {number} props.propiedad2 - Descripción de la propiedad2
 * @param {Function} props.onAlgunaAccion - Función que se ejecuta cuando ocurre alguna acción
 * @param {ReactNode} [props.children] - Contenido hijo opcional
 * @param {string} [props.className] - Clases CSS adicionales (opcional)
 * 
 * @returns {JSX.Element} Componente [NOMBRE]
 */
function NombreComponente({ propiedad1, propiedad2, onAlgunaAccion, children, className }) {
  // Implementación del componente...
  
  return (
    <div className={className}>
      {/* Contenido del componente */}
    </div>
  );
}

export default NombreComponente;
```

## Estructura de Documentación Completa

Para componentes complejos, considere incluir las siguientes secciones en un archivo README.md separado o en comentarios extensos:

### 1. Descripción General

Explique brevemente qué es el componente y para qué se utiliza.

### 2. Props

Documente todas las propiedades que acepta el componente:

| Prop | Tipo | Requerido | Valor por defecto | Descripción |
|------|------|-----------|-------------------|-------------|
| `propiedad1` | `string` | Sí | - | Descripción detallada |
| `propiedad2` | `number` | Sí | - | Descripción detallada |
| `onAlgunaAccion` | `Function` | Sí | - | Descripción detallada |
| `children` | `ReactNode` | No | `null` | Descripción detallada |
| `className` | `string` | No | `''` | Clases CSS adicionales |

### 3. Estados Internos

Documente los estados internos importantes del componente:

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `cargando` | `boolean` | Indica si el componente está cargando datos |
| `datos` | `Array` | Almacena los datos obtenidos del servidor |
| `error` | `string` | Mensaje de error si ocurre algún problema |

### 4. Efectos

Documente los efectos (useEffect) utilizados en el componente:

```jsx
// Efecto para cargar datos al montar el componente
useEffect(() => {
  // Descripción de lo que hace este efecto
  // ...
}, [dependencia1, dependencia2]);
```

### 5. Funciones Internas

Documente las funciones internas importantes:

```jsx
/**
 * Maneja el envío del formulario
 * @param {Event} e - Evento del formulario
 */
const manejarEnvio = (e) => {
  e.preventDefault();
  // Descripción de lo que hace esta función
};
```

### 6. Renderizado Condicional

Explique las diferentes condiciones de renderizado:

```jsx
// Renderizado cuando está cargando
if (cargando) {
  return <Spinner />;
}

// Renderizado cuando hay un error
if (error) {
  return <MensajeError mensaje={error} />;
}

// Renderizado normal
return (
  // ...
);
```

### 7. Ejemplos de Uso

Proporcione ejemplos de cómo utilizar el componente en diferentes escenarios:

```jsx
// Ejemplo básico
<NombreComponente propiedad1="valor" propiedad2={42} />

// Ejemplo con children
<NombreComponente propiedad1="valor" propiedad2={42}>
  <p>Contenido hijo</p>
</NombreComponente>

// Ejemplo con manejo de eventos
<NombreComponente 
  propiedad1="valor" 
  propiedad2={42} 
  onAlgunaAccion={() => console.log('Acción ejecutada')} 
/>
```

### 8. Notas de Implementación

Incluya notas importantes sobre la implementación, limitaciones conocidas o consideraciones de rendimiento.

### 9. Dependencias

Liste las dependencias externas que utiliza el componente:

- `react-bootstrap`: Para componentes de UI
- `date-fns`: Para formateo de fechas
- Etc.

### 10. Historial de Cambios

Mantenga un registro de los cambios importantes:

- **v1.1.0** (2023-06-15): Añadida funcionalidad X
- **v1.0.0** (2023-05-01): Implementación inicial