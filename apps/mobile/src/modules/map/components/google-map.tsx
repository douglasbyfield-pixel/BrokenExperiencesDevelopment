import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps'
import { MapPin } from 'lucide-react'
import { environment } from '../../../config/environment'
import type { Location } from '../types'

interface GoogleMapProps {
  /** The center location of the map */
  center: Location
  /** The zoom level of the map (1-20) */
  zoom?: number
  /** Height of the map container */
  height?: string | number
  /** Width of the map container */
  width?: string | number
  /** Whether to show a marker at the center location */
  showMarker?: boolean
  /** Custom marker color */
  markerColor?: string
  /** Custom marker border color */
  markerBorderColor?: string
  /** Custom marker glyph color */
  markerGlyphColor?: string
  /** Whether the marker is clickable */
  markerClickable?: boolean
  /** Callback when marker is clicked */
  onMarkerClick?: (location: Location) => void
  /** Custom map ID for styling */
  mapId?: string
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Loading message */
  loadingMessage?: string
}

export function GoogleMap({
  center,
  zoom = 15,
  height = '100%',
  width = '100%',
  showMarker = true,
  markerColor = '#3b82f6',
  markerBorderColor = '#1e40af',
  markerGlyphColor = '#fff',
  markerClickable = false,
  onMarkerClick,
  mapId = 'DEMO_MAP_ID',
  className = '',
  isLoading = false,
  loadingMessage = 'Loading map...',
}: GoogleMapProps) {
  const handleMarkerClick = () => {
    if (onMarkerClick) {
      onMarkerClick(center)
    }
  }

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (!environment.mapsApiKey) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Google Maps API key not configured</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className} style={{ height, width }}>
      <APIProvider apiKey={environment.mapsApiKey}>
        <Map
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          mapId={mapId}
        >
          {showMarker && (
            <AdvancedMarker 
              position={center}
              clickable={markerClickable}
              onClick={markerClickable ? handleMarkerClick : undefined}
            >
              <Pin 
                background={markerColor} 
                glyphColor={markerGlyphColor} 
                borderColor={markerBorderColor} 
              />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
    </div>
  )
}
