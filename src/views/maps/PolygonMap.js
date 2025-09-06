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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'

// Configuración del mapa
const mapConfig = {
  center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  zoom: 12,
}

// Componente del mapa
const MapComponent = ({ center, zoom, onMapLoad, onMapClick }) => {
  const ref = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'satellite',
      })
      setMap(newMap)
      if (onMapLoad) {
        onMapLoad(newMap)
      }
    }
  }, [ref, map, center, zoom, onMapLoad])

  useEffect(() => {
    if (map && onMapClick) {
      const clickListener = map.addListener('click', onMapClick)
      return () => {
        window.google.maps.event.removeListener(clickListener)
      }
    }
  }, [map, onMapClick])

  return <div ref={ref} style={{ width: '100%', height: '600px' }} />
}

const PolygonMap = () => {
  const [map, setMap] = useState(null)
  const [polygonPath, setPolygonPath] = useState([])
  const polygonRef = useRef(null)
  const [area, setArea] = useState(0)

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
  }, [])

  const handleMapClick = (e) => {
    const newPath = [...polygonPath, e.latLng.toJSON()]
    setPolygonPath(newPath)
  }

  const clearPolygon = () => {
    setPolygonPath([])
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
      polygonRef.current = null
    }
    setArea(0)
  }

  useEffect(() => {
    if (map) {
      if (polygonRef.current) {
        polygonRef.current.setMap(null)
      }

      if (polygonPath.length > 0) {
        const newPolygon = new window.google.maps.Polygon({
          paths: polygonPath,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          editable: true,
          draggable: true,
        })

        newPolygon.setMap(map)
        polygonRef.current = newPolygon

        const updateArea = () => {
          const path = newPolygon.getPath()
          const polygonArea = window.google.maps.geometry.spherical.computeArea(path)
          setArea(polygonArea)
        }

        newPolygon.getPath().addListener('set_at', updateArea)
        newPolygon.getPath().addListener('insert_at', updateArea)
        newPolygon.getPath().addListener('remove_at', updateArea)

        updateArea()
      }
    }
  }, [map, polygonPath])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const libraries = React.useMemo(() => ['geometry'], [])

  if (!apiKey) {
    return (
      <CAlert color="warning">
        La clave de API para Google Maps no está configurada. Por favor, agrégala a tu archivo .env.
      </CAlert>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Delimitar Terreno con Polígono</strong>
              <small className="text-medium-emphasis ms-2">
                Haz clic en el mapa para agregar puntos
              </small>
            </div>
            <CButton color="danger" onClick={clearPolygon} disabled={polygonPath.length === 0}>
              <CIcon icon={cilTrash} className="me-1" />
              Limpiar Polígono
            </CButton>
          </CCardHeader>
          <CCardBody>
            <Wrapper apiKey={apiKey} libraries={libraries} render={(status) => {
                switch (status) {
                  case 'LOADING':
                    return <CSpinner />
                  case 'FAILURE':
                    return <CAlert color="danger">Error al cargar Google Maps.</CAlert>
                  case 'SUCCESS':
                    return (
                      <MapComponent
                        center={mapConfig.center}
                        zoom={mapConfig.zoom}
                        onMapLoad={onMapLoad}
                        onMapClick={handleMapClick}
                      />
                    )
                  default:
                    return <CSpinner />
                }
              }}
            />
            {area > 0 && (
              <div className="mt-3">
                <h5>Área del Polígono:</h5>
                <p>{(area / 10000).toFixed(4)} hectáreas</p>
                <p>{area.toFixed(2)} metros cuadrados</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PolygonMap
