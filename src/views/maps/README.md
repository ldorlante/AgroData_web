# Mapas en AgroData

Este directorio contiene los componentes de mapas para la aplicación AgroData.

## Componentes Disponibles

### 1. GoogleMaps.js
Un componente básico de Google Maps con las siguientes características:
- Vista interactiva del mapa
- Marcadores personalizables
- Cambio entre vista de mapa, satélite e híbrida
- Geolocalización del usuario
- InfoWindows con información detallada

### 2. AgroMaps.js
Un componente especializado para agricultura con funcionalidades avanzadas:
- Marcadores específicos para agricultura (granjas, campos, sensores, sistemas de riego)
- Agregar marcadores haciendo click en el mapa
- Panel lateral con lista de elementos
- Modal para editar/agregar elementos
- Leyenda con tipos de marcadores
- Iconos personalizados para cada tipo de elemento

## Configuración

### Variables de Entorno
Asegúrate de tener configurada la API Key de Google Maps en tu archivo `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### Obtener API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Maps JavaScript API**
4. Ve a **APIs & Services > Credentials**
5. Crea una nueva API Key
6. (Opcional) Restringe la API Key por dominio para mayor seguridad

### APIs Requeridas
Para un funcionamiento completo, habilita estas APIs en Google Cloud Console:
- **Maps JavaScript API** - Para mostrar el mapa
- **Geocoding API** - Para búsqueda de direcciones
- **Places API** - Para búsqueda de lugares (opcional)

## Uso

### Importar los componentes
```javascript
import { GoogleMaps, AgroMaps } from './views/maps'
```

### Rutas Configuradas
- `/maps/google-maps` - Mapa básico de Google Maps
- `/maps/agro-maps` - Mapa especializado para agricultura

## Características del Mapa Agrícola

### Tipos de Marcadores
- 🚜 **Granja** - Ubicaciones principales de granjas
- 🌾 **Campo de Cultivo** - Áreas de cultivo específicas
- 🏭 **Almacén** - Instalaciones de almacenamiento
- 📡 **Sensor IoT** - Dispositivos de monitoreo
- 💧 **Sistema de Riego** - Infraestructura de riego

### Funcionalidades Interactivas
- **Click en el mapa**: Agregar nuevos marcadores
- **Click en marcadores**: Ver información detallada
- **Panel lateral**: Lista de todos los elementos
- **Modal de edición**: Modificar propiedades de los marcadores
- **Leyenda**: Identificar tipos de marcadores

## Personalización

### Estilos del Mapa
Los estilos están configurados en `mapConfig.styles` y `agroMapConfig.styles`. Puedes personalizarlos para cambiar la apariencia del mapa.

### Tipos de Marcadores
Para agregar nuevos tipos de marcadores agrícolas, modifica el objeto `markerTypes` en `AgroMaps.js`:

```javascript
const markerTypes = {
  // Tipos existentes...
  newType: { 
    icon: '🌱', 
    color: '#4CAF50', 
    name: 'Nuevo Tipo' 
  },
}
```

### Marcadores Personalizados
Los marcadores utilizan SVG para crear iconos personalizados con colores y emojis. Esto permite una fácil personalización sin necesidad de archivos de imagen externos.

## Dependencias

- `@googlemaps/react-wrapper` - Wrapper oficial de Google Maps para React
- `@coreui/react` - Componentes de UI
- `@coreui/icons-react` - Iconos

## Próximas Mejoras

- Integración con base de datos para persistir marcadores
- Capas de datos (clima, suelo, etc.)
- Rutas y navegación entre puntos
- Medición de distancias y áreas
- Importar/exportar datos en formato KML/GeoJSON
- Integración con sensores IoT en tiempo real
