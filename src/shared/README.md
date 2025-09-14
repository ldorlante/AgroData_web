# Shared Components

Esta carpeta contiene componentes que se comparten entre las vistas públicas y privadas de la aplicación.

## Estructura

- `dashboard/` - Componentes relacionados con el dashboard que se usan tanto en la vista pública como en la autenticada
  - `Dashboard.js` - Componente principal del dashboard con estadísticas y gráficos
  - `MainChart.js` - Componente del gráfico principal
  - `index.js` - Exports de los componentes del dashboard

## Propósito

Los componentes en esta carpeta son reutilizables y no dependen del contexto de autenticación. Esto permite:

1. **Reutilización de código**: Evita duplicación entre vistas públicas y privadas
2. **Mantenimiento simplificado**: Cambios en un solo lugar para ambas vistas
3. **Consistencia**: Garantiza que la experiencia sea similar entre vistas públicas y privadas
4. **Escalabilidad**: Facilita agregar más componentes compartidos en el futuro

## Convenciones

- Los componentes deben ser agnósticos al contexto de autenticación
- Deben ser autocontenidos y no depender de estado global específico
- Las rutas de importación deben ser relativas y claras
