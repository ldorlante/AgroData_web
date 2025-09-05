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
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilLocationPin, 
  cilMap, 
  cilSatelite, 
  cilPlus, 
  cilTrash,
  cilPencil,
  cilLeaf,
  cilGrain,
} from '@coreui/icons'

// Configuración específica para mapas agrícolas
const agroMapConfig = {
  center: { lat: -34.6037, lng: -58.3816 }, // Centro default
  zoom: 10,
  styles: [
    {
      featureType: 'landscape.natural',
      elementType: 'geometry.fill',
      stylers: [{ color: '#e8f5e8' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [{ color: '#c8e6c9' }],
    },
  ],
}

// Tipos de marcadores agrícolas
const markerTypes = {
  farm: { icon: '🚜', color: '#4CAF50', name: 'Granja' },
  field: { icon: '🌾', color: '#8BC34A', name: 'Campo de Cultivo' },
  warehouse: { icon: '🏭', color: '#FF9800', name: 'Almacén' },
  sensor: { icon: '📡', color: '#2196F3', name: 'Sensor IoT' },
  irrigation: { icon: '💧', color: '#00BCD4', name: 'Sistema de Riego' },
}

// Componente del mapa agrícola
const AgroMapComponent = ({ center, zoom, onMapLoad, mapType, onMapClick }) => {
  const ref = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: mapType || window.google.maps.MapTypeId.HYBRID,
        styles: agroMapConfig.styles,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      })
      
      // Agregar listener para clicks en el mapa
      if (onMapClick) {
        newMap.addListener('click', (event) => {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          })
        })
      }
      
      setMap(newMap)
      if (onMapLoad) {
        onMapLoad(newMap)
      }
    }
  }, [ref, map, center, zoom, onMapLoad, mapType, onMapClick])

  useEffect(() => {
    if (map && mapType) {
      map.setMapTypeId(mapType)
    }
  }, [map, mapType])

  return <div ref={ref} style={{ width: '100%', height: '600px' }} />
}

// Componente de marcador agrícola
const AgroMarkerComponent = ({ map, marker, onClick, onDelete }) => {
  const [mapMarker, setMapMarker] = useState(null)

  useEffect(() => {
    if (!mapMarker && map && marker.position) {
      const markerType = markerTypes[marker.type] || markerTypes.farm
      
      const newMarker = new window.google.maps.Marker({
        position: marker.position,
        map,
        title: marker.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${markerType.color}" stroke="#fff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">${markerType.icon}</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        animation: window.google.maps.Animation.DROP,
      })

      // Crear InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 250px;">
            <h6>${marker.name}</h6>
            <p><strong>Tipo:</strong> ${markerType.name}</p>
            <p><strong>Descripción:</strong> ${marker.description || 'Sin descripción'}</p>
            <p><strong>Coordenadas:</strong> ${marker.position.lat.toFixed(6)}, ${marker.position.lng.toFixed(6)}</p>
            ${marker.data ? `<p><strong>Datos:</strong> ${JSON.stringify(marker.data)}</p>` : ''}
            <div style="margin-top: 10px;">
              <button onclick="window.editMarker('${marker.id}')" style="margin-right: 5px; padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Editar
              </button>
              <button onclick="window.deleteMarker('${marker.id}')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Eliminar
              </button>
            </div>
          </div>
        `,
      })

      newMarker.addListener('click', () => {
        infoWindow.open(map, newMarker)
        if (onClick) {
          onClick(marker)
        }
      })

      // Funciones globales para los botones del InfoWindow
      window.editMarker = (markerId) => {
        if (onClick) {
          onClick({ ...marker, action: 'edit' })
        }
      }

      window.deleteMarker = (markerId) => {
        if (onDelete) {
          onDelete(markerId)
        }
      }

      setMapMarker(newMarker)
    }

    return () => {
      if (mapMarker) {
        mapMarker.setMap(null)
      }
    }
  }, [mapMarker, map, marker, onClick, onDelete])

  return null
}

const AgroMaps = () => {
  const [map, setMap] = useState(null)
  const [center, setCenter] = useState(agroMapConfig.center)
  const [markers, setMarkers] = useState([])
  const [mapType, setMapType] = useState('hybrid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [editingMarker, setEditingMarker] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'farm',
    description: '',
  })

  const onMapLoad = useCallback((map) => {
    setMap(map)
    setLoading(false)

    // Marcadores de ejemplo para agricultura
    const exampleMarkers = [
      {
        id: '1',
        name: 'Granja Principal',
        type: 'farm',
        position: { lat: -34.6037, lng: -58.3816 },
        description: 'Granja principal con cultivos de soja y maíz',
        data: { hectares: 150, cultivo: 'soja' },
      },
      {
        id: '2',
        name: 'Campo Norte',
        type: 'field',
        position: { lat: -34.5937, lng: -58.3716 },
        description: 'Campo de cultivo de trigo',
        data: { hectares: 80, cultivo: 'trigo' },
      },
      {
        id: '3',
        name: 'Sensor de Humedad #1',
        type: 'sensor',
        position: { lat: -34.6137, lng: -58.3916 },
        description: 'Sensor IoT para monitoreo de humedad del suelo',
        data: { humedad: '65%', temperatura: '22°C' },
      },
      {
        id: '4',
        name: 'Sistema de Riego Central',
        type: 'irrigation',
        position: { lat: -34.6037, lng: -58.3616 },
        description: 'Sistema central de riego automatizado',
        data: { presion: '2.5 bar', estado: 'activo' },
      },
    ]
    setMarkers(exampleMarkers)
  }, [])

  // Manejar click en el mapa para agregar marcador
  const handleMapClick = (position) => {
    setSelectedPosition(position)
    setShowAddModal(true)
    setEditingMarker(null)
    setFormData({ name: '', type: 'farm', description: '' })
  }

  // Manejar click en marcador
  const handleMarkerClick = (marker) => {
    if (marker.action === 'edit') {
      setEditingMarker(marker)
      setFormData({
        name: marker.name,
        type: marker.type,
        description: marker.description || '',
      })
      setShowAddModal(true)
    }
  }

  // Eliminar marcador
  const handleDeleteMarker = (markerId) => {
    setMarkers(markers.filter(m => m.id !== markerId))
  }

  // Guardar marcador (nuevo o editado)
  const handleSaveMarker = () => {
    if (editingMarker) {
      // Editar marcador existente
      setMarkers(markers.map(m => 
        m.id === editingMarker.id 
          ? { ...m, name: formData.name, type: formData.type, description: formData.description }
          : m
      ))
    } else {
      // Agregar nuevo marcador
      const newMarker = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        description: formData.description,
        position: selectedPosition,
      }
      setMarkers([...markers, newMarker])
    }
    
    setShowAddModal(false)
    setEditingMarker(null)
    setSelectedPosition(null)
    setFormData({ name: '', type: 'farm', description: '' })
  }

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

  const LoadingComponent = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
      <div className="text-center">
        <CSpinner color="primary" variant="grow" />
        <div className="mt-2">Cargando mapa agrícola...</div>
      </div>
    </div>
  )

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
              <CIcon icon={cilLeaf} className="me-2" />
              <strong>Mapa Agrícola</strong>
            </CCardHeader>
            <CCardBody>
              <CAlert color="warning">
                <strong>Configuración requerida:</strong> 
                <br />
                Para usar Google Maps, necesitas agregar tu API Key en el archivo .env:
                <br />
                <code>VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui</code>
              </CAlert>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12} lg={8}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <CIcon icon={cilLeaf} className="me-2" />
                <strong>Mapa Agrícola</strong>
                <small className="text-medium-emphasis ms-2">
                  Click en el mapa para agregar marcadores
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
                          <AgroMapComponent
                            center={center}
                            zoom={agroMapConfig.zoom}
                            onMapLoad={onMapLoad}
                            mapType={mapType}
                            onMapClick={handleMapClick}
                          />
                          {map && markers.map((marker) => (
                            <AgroMarkerComponent
                              key={marker.id}
                              map={map}
                              marker={marker}
                              onClick={handleMarkerClick}
                              onDelete={handleDeleteMarker}
                            />
                          ))}
                        </div>
                      )
                    default:
                      return <LoadingComponent />
                  }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
        
        {/* Panel lateral con lista de marcadores */}
        <CCol xs={12} lg={4}>
          <CCard>
            <CCardHeader>
              <CIcon icon={cilGrain} className="me-2" />
              <strong>Elementos del Mapa</strong>
              <CBadge color="primary" className="ms-2">{markers.length}</CBadge>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                {markers.map((marker) => {
                  const markerType = markerTypes[marker.type] || markerTypes.farm
                  return (
                    <CListGroupItem 
                      key={marker.id}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <div className="fw-bold">
                          {markerType.icon} {marker.name}
                        </div>
                        <small className="text-muted">{markerType.name}</small>
                        <br />
                        <small>{marker.description}</small>
                      </div>
                      <CBadge color="secondary" style={{ backgroundColor: markerType.color }}>
                        {markerType.name}
                      </CBadge>
                    </CListGroupItem>
                  )
                })}
                {markers.length === 0 && (
                  <CListGroupItem className="text-center text-muted">
                    No hay elementos en el mapa.<br />
                    Haz click en el mapa para agregar uno.
                  </CListGroupItem>
                )}
              </CListGroup>
            </CCardBody>
          </CCard>

          {/* Leyenda */}
          <CCard className="mt-3">
            <CCardHeader>
              <strong>Leyenda</strong>
            </CCardHeader>
            <CCardBody>
              {Object.entries(markerTypes).map(([key, type]) => (
                <div key={key} className="d-flex align-items-center mb-2">
                  <div 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: type.color, 
                      borderRadius: '50%',
                      marginRight: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}
                  >
                    {type.icon}
                  </div>
                  <span>{type.name}</span>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal para agregar/editar marcadores */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editingMarker ? 'Editar Elemento' : 'Agregar Nuevo Elemento'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel htmlFor="markerName">Nombre</CFormLabel>
              <CFormInput
                type="text"
                id="markerName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Granja Principal, Campo Norte..."
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="markerType">Tipo</CFormLabel>
              <CFormSelect
                id="markerType"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {Object.entries(markerTypes).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="markerDescription">Descripción</CFormLabel>
              <CFormInput
                type="text"
                id="markerDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional..."
              />
            </div>
            {selectedPosition && (
              <div className="mb-3">
                <CFormLabel>Coordenadas</CFormLabel>
                <CFormInput
                  type="text"
                  value={`${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`}
                  readOnly
                />
              </div>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveMarker}
            disabled={!formData.name.trim()}
          >
            <CIcon icon={editingMarker ? cilPencil : cilPlus} className="me-1" />
            {editingMarker ? 'Actualizar' : 'Agregar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AgroMaps
