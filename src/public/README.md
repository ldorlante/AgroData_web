# Public Views

Esta carpeta contiene todos los componentes, layouts y estilos específicos para las vistas públicas de la aplicación (sin autenticación requerida).

## Estructura

- `components/` - Componentes específicos para vistas públicas
  - `PublicHeader.js` - Header para las páginas públicas
  - `index.js` - Exports de componentes públicos

- `layouts/` - Layouts para páginas públicas
  - `PublicDashboardLayout.js` - Layout principal para el dashboard público
  - `index.js` - Exports de layouts públicos

- `styles/` - Estilos específicos para vistas públicas
  - `public-dashboard.scss` - Estilos del dashboard público

## Propósito

Esta organización permite:

1. **Separación clara**: Diferenciación entre funcionalidades públicas y privadas
2. **Mantenimiento**: Facilita encontrar y modificar código específico de vistas públicas
3. **Escalabilidad**: Estructura preparada para agregar más vistas públicas
4. **Arquitectura**: Refleja claramente la arquitectura de la aplicación

## Características de las vistas públicas

- No requieren autenticación
- Interfaz simplificada enfocada en mostrar información clave
- Header con navegación básica y opción de login
- Acceso limitado a funcionalidades (solo visualización)
- Diseño responsivo para todos los dispositivos
