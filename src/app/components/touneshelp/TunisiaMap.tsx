import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import type { TunisiaCase } from '../../data/tunisiaData';

interface TunisiaMapProps {
  cases: TunisiaCase[];
  height?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Tunisia center coordinates
const tunisiaCenter = {
  lat: 34.0,
  lng: 9.0,
};

// Replace this with your actual Google Maps API key
// Get one at: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_API_KEY = 'AIzaSyAmk4IjHlJsQb8gchi-9SXxRD0vGaCsxaI';

// Check if we have a valid API key
const hasValidApiKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

// Fallback component when no API key is configured
function MapFallback({ cases, height }: { cases: TunisiaCase[], height: string }) {
  const { t } = useTranslation();
  return (
    <div style={{ height }} className="w-full bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300">
      <div className="text-center max-w-2xl px-6">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-2xl font-bold text-[#1C1C1E] mb-2">{t("map_page.interactive_map", "Carte Interactive de la Tunisie")}</h3>
        <p className="text-[#6B6B6B] mb-6">
          {t("map_page.map_config_info", "Pour afficher la carte interactive avec les emplacements précis, configurez une clé API Google Maps")}
        </p>
        
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-left mb-6">
          <h4 className="font-bold text-[#1C1C1E] mb-3">📝 Configuration requise :</h4>
          <ol className="text-sm text-[#6B6B6B] space-y-2 list-decimal list-inside">
            <li>Visitez <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-[#C0392B] underline">Google Cloud Console</a></li>
            <li>Créez un projet et activez "Maps JavaScript API"</li>
            <li>Générez une clé API</li>
            <li>Dans <code className="bg-gray-100 px-2 py-1 rounded text-xs">/src/app/components/touneshelp/TunisiaMap.tsx</code>, remplacez <code className="bg-gray-100 px-2 py-1 rounded text-xs">YOUR_GOOGLE_MAPS_API_KEY</code> par votre clé</li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#C0392B]" />
            <span>🔴 {t("map_page.status_suffering", "Souffre encore")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#E67E22]" />
            <span>🟠 {t("map_page.status_helping", "En cours d'aide")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#27AE60]" />
            <span>🟢 {t("map_page.status_resolved", "Résolu")}</span>
          </div>
        </div>

        <p className="text-sm text-[#6B6B6B] mt-6">
          {t("map_page.cases_on_map", { count: cases.length })}
        </p>
      </div>
    </div>
  );
}

// Main map component - only used when API key is valid
function TunisiaMapInner({ cases, height = '600px', zoom = 7, center = tunisiaCenter }: TunisiaMapProps) {
  const { t } = useTranslation();
  const [selectedCase, setSelectedCase] = useState<TunisiaCase | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getMarkerIcon = (status: TunisiaCase['status']) => {
    const colors = {
      suffering: '#C0392B',
      helping: '#E67E22',
      resolved: '#27AE60',
    };

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: colors[status],
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
    };
  };

  const statusConfig = {
    suffering: { label: t("map_page.status_suffering", 'Souffre encore'), className: 'bg-[#C0392B] text-white' },
    helping: { label: t("map_page.status_helping", "En cours d'aide"), className: 'bg-[#E67E22] text-white' },
    resolved: { label: t("map_page.status_resolved", 'Résolu'), className: 'bg-[#27AE60] text-white' },
  };

  if (loadError) {
    return <MapFallback cases={cases} height={height} />;
  }

  if (!isLoaded) {
    return (
      <div style={{ height }} className="w-full bg-gradient-to-br from-green-100 via-yellow-50 to-orange-100 flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-[#6B6B6B]">{t("map_page.loading_map", "Chargement de la carte...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          mapId: 'TUNISIA_HELP_MAP',
        }}
      >
        {cases.map((caseData) => (
          <Marker
            key={caseData.id}
            position={{ lat: caseData.coordinates[0], lng: caseData.coordinates[1] }}
            onClick={() => setSelectedCase(caseData)}
            icon={getMarkerIcon(caseData.status)}
            options={{
              optimized: true,
            }}
          />
        ))}

        {selectedCase && (
          <InfoWindow
            position={{ lat: selectedCase.coordinates[0], lng: selectedCase.coordinates[1] }}
            onCloseClick={() => setSelectedCase(null)}
          >
            <div className="p-2 max-w-[280px]">
              <Badge className={`${statusConfig[selectedCase.status].className} mb-2`}>
                {statusConfig[selectedCase.status].label}
              </Badge>
              <h3 className="font-bold text-[#1C1C1E] mb-2 text-sm">{selectedCase.title}</h3>
              <p className="text-xs text-[#6B6B6B] mb-1">
                📍 {selectedCase.governorate}, {selectedCase.city}
              </p>
              <p className="text-xs text-[#6B6B6B] mb-3 line-clamp-2">
                {selectedCase.description}
              </p>
              <div className="flex gap-2">
                <Link to={`/cas/${selectedCase.id}`}>
                  <Button size="sm" className="bg-[#C0392B] hover:bg-[#A02E24] text-white text-xs h-8">
                    {t("map_page.view_case", "Voir le cas")}
                  </Button>
                </Link>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCase.coordinates[0]},${selectedCase.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="text-xs h-8">
                    {t("map_page.directions", "Itinéraire")}
                  </Button>
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

// Main export - conditionally renders map or fallback
export function TunisiaMap({ cases, height = '600px', zoom = 7, center = tunisiaCenter }: TunisiaMapProps) {
  // If no valid API key, show fallback immediately without loading Google Maps
  if (!hasValidApiKey) {
    return <MapFallback cases={cases} height={height} />;
  }

  // Otherwise, render the actual map component
  return <TunisiaMapInner cases={cases} height={height} zoom={zoom} center={center} />;
}