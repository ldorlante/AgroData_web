import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Wrapper } from '@googlemaps/react-wrapper'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CButton,
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilMap, cilSatelite } from '@coreui/icons'

// Configuración del mapa
const mapConfig = {
  center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires, Argentina (centro default)
  zoom: 12,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry.fill',
      stylers: [{ weight: '2.00' }],
    },
    {
      featureType: 'all',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#9c9c9c' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text',
      stylers: [{ visibility: 'on' }],
    },
  ],
}

// Componente del mapa
const MapComponent = ({ center, zoom, onMapLoad, mapType }) => {
  const ref = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: mapType || window.google.maps.MapTypeId.ROADMAP,
        styles: mapConfig.styles,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      })
      
      setMap(newMap)
      if (onMapLoad) {
        onMapLoad(newMap)
      }
    }
  }, [ref, map, center, zoom, onMapLoad, mapType])

  // Actualizar tipo de mapa cuando cambie
  useEffect(() => {
    if (map && mapType) {
      map.setMapTypeId(mapType)
    }
  }, [map, mapType])

  return <div ref={ref} style={{ width: '100%', height: '500px' }} />
}

// Componente de marcador
const MarkerComponent = ({ map, position, title, onClick }) => {
  const [marker, setMarker] = useState(null)

  useEffect(() => {
    if (!marker && map && position) {
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        title,
        animation: window.google.maps.Animation.DROP,
      })

      if (onClick) {
        newMarker.addListener('click', onClick)
      }

      setMarker(newMarker)
    }

    return () => {
      if (marker) {
        marker.setMap(null)
      }
    }
  }, [marker, map, position, title, onClick])

  return null
}

const GoogleMaps = () => {
  const [map, setMap] = useState(null)
  const [center, setCenter] = useState(mapConfig.center)
  const [markers, setMarkers] = useState([])
  const [mapType, setMapType] = useState('roadmap')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar el mapa
  const onMapLoad = useCallback((map) => {
    setMap(map)
    setLoading(false)

    // Agregar algunos marcadores de ejemplo
    const exampleMarkers = [
      {
        id: 1,
        position: { lat: -34.6037, lng: -58.3816 },
        title: 'Buenos Aires',
        info: 'Capital de Argentina',
      },
      {
        id: 2,
        position: { lat: -34.6118, lng: -58.3960 },
        title: 'Puerto Madero',
        info: 'Distrito financiero',
      },
      {
        id: 3,
        position: { lat: -34.5875, lng: -58.3974 },
        title: 'Palermo',
        info: 'Barrio residencial y comercial',
      },
    ]
    setMarkers(exampleMarkers)
  }, [])

  // Obtener ubicación actual del usuario
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCenter(userLocation)
          if (map) {
            map.setCenter(userLocation)
            map.setZoom(15)
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          setError('No se pudo obtener la ubicación actual')
        }
      )
    } else {
      setError('La geolocalización no está soportada en este navegador')
    }
  }

  // Manejar click en marcadores
  const handleMarkerClick = (marker) => {
    if (map) {
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h6>${marker.title}</h6>
            <p>${marker.info}</p>
          </div>
        `,
      })
      infoWindow.open(map, marker)
    }
  }

  // Componente de carga
  const LoadingComponent = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
      <div className="text-center">
        <CSpinner color="primary" variant="grow" />
        <div className="mt-2">Cargando mapa...</div>
      </div>
    </div>
  )

  // Componente de error
  const ErrorComponent = ({ error }) => (
    <CAlert color="danger">
      <strong>Error:</strong> {error}
    </CAlert>
  )

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>Google Maps</strong>
            </CCardHeader>
            <CCardBody>
              <CAlert color="warning">
                <strong>Configuración requerida:</strong> 
                <br />
                Para usar Google Maps, necesitas agregar tu API Key en el archivo .env:
                <br />
                <code>VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui</code>
                <br />
                <br />
                Puedes obtener una API Key en: 
                <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                  Google Cloud Console
                </a>
              </CAlert>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Google Maps</strong>
              <small className="text-medium-emphasis ms-2">
                Vista interactiva del mapa
              </small>
            </div>
            <div>
              <CButtonGroup className="me-2">
                <CButton
                  color={mapType === 'roadmap' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setMapType('roadmap')}
                >
                  <CIcon icon={cilMap} className="me-1" />
                  Mapa
                </CButton>
                <CButton
                  color={mapType === 'satellite' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setMapType('satellite')}
                >
                  <CIcon icon={cilSatelite} className="me-1" />
                  Satélite
                </CButton>
                <CButton
                  color={mapType === 'hybrid' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setMapType('hybrid')}
                >
                  Híbrido
                </CButton>
              </CButtonGroup>
              <CButton
                color="success"
                size="sm"
                onClick={getCurrentLocation}
              >
                <CIcon icon={cilLocationPin} className="me-1" />
                Mi Ubicación
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <ErrorComponent error={error} />}
            
            <Wrapper
              apiKey={apiKey}
              render={(status) => {
                switch (status) {
                  case 'LOADING':
                    return <LoadingComponent />
                  case 'FAILURE':
                    return <ErrorComponent error="Error al cargar Google Maps" />
                  case 'SUCCESS':
                    return (
                      <div>
                        <MapComponent
                          center={center}
                          zoom={mapConfig.zoom}
                          onMapLoad={onMapLoad}
                          mapType={mapType}
                        />
                        {map && markers.map((marker) => (
                          <MarkerComponent
                            key={marker.id}
                            map={map}
                            position={marker.position}
                            title={marker.title}
                            onClick={() => handleMarkerClick(marker)}
                          />
                        ))}
                      </div>
                    )
                  default:
                    return <LoadingComponent />
                }
              }}
            />
            
            {loading && <LoadingComponent />}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Información adicional */}
      <CCol xs={12} className="mt-3">
        <CCard>
          <CCardHeader>
            <strong>Información del Mapa</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <h6>Características:</h6>
                <ul>
                  <li>Vista de mapa interactivo</li>
                  <li>Marcadores personalizables</li>
                  <li>Información en ventanas emergentes</li>
                  <li>Cambio entre vista de mapa y satélite</li>
                  <li>Geolocalización del usuario</li>
                  <li>Controles de zoom y navegación</li>
                </ul>
              </CCol>
              <CCol md={6}>
                <h6>Controles:</h6>
                <ul>
                  <li><strong>Mapa:</strong> Vista de calles estándar</li>
                  <li><strong>Satélite:</strong> Vista satelital</li>
                  <li><strong>Híbrido:</strong> Satélite con etiquetas</li>
                  <li><strong>Mi Ubicación:</strong> Centrar en tu ubicación</li>
                  <li><strong>Click en marcadores:</strong> Ver información</li>
                </ul>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GoogleMaps
