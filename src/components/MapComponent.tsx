import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the VillageDashboardType interface (or import it if it's in a shared file)
interface VillageDashboardType {
  id: number;
  village_name: string;
  district: string;
  state: string;
  total_cases: number;
  risk_level: "Very Low" | "Low" | "Moderate" | "High" | "Very High";
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  villages: VillageDashboardType[];
  onVillageSelect: (villageId: number) => void;
  selectedVillageId: number | null;
}

// Function to determine risk color based on risk level (copied from AdminDashboard.tsx)
const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Very Low":
      return "#22c55e"; // green
    case "Low":
      return "#84cc16"; // lime
    case "Moderate":
      return "#eab308"; // yellow
    case "High":
      return "#f97316"; // orange
    case "Very High":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

// Custom hook to recenter map
const RecenterAutomatically = ({ selectedVillageData }: { selectedVillageData: VillageDashboardType | null }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedVillageData && selectedVillageData.latitude && selectedVillageData.longitude) {
      map.setView([selectedVillageData.latitude, selectedVillageData.longitude], 8);
    }
  }, [selectedVillageData]);
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ villages, onVillageSelect, selectedVillageId }) => {
  const center: [number, number] = [25.5, 93.5]; // Centered on Northeast India

  const createCustomIcon = (riskLevel: VillageDashboardType['risk_level'], isSelected: boolean) => {
    const color = getRiskColor(riskLevel);
    const borderColor = isSelected ? '4px solid #3b82f6' : '2px solid white'; // Highlight selected
    const markerHtml = `
      <div style="background-color: ${color}; border: ${borderColor};" class="w-6 h-6 rounded-full shadow-lg"></div>
    `;
    return L.divIcon({
      html: markerHtml,
      className: 'custom-leaflet-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const selectedVillageData = villages.find(v => v.id === selectedVillageId);

  return (
    <div className="relative w-full h-96 rounded-lg border-2 border-gray-200 overflow-hidden z-0">
      <MapContainer center={center} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {villages.map((village) => (
          village.latitude && village.longitude && (
            <Marker
              key={village.id}
              position={[village.latitude, village.longitude]}
              icon={createCustomIcon(village.risk_level, village.id === selectedVillageId)}
              eventHandlers={{
                click: () => {
                  onVillageSelect(village.id);
                },
              }}
            >
              <Popup>
                <b>{village.village_name}</b><br />
                {village.district}, {village.state}<br />
                Risk: {village.risk_level}<br />
                Cases: {village.total_cases}
              </Popup>
            </Marker>
          )
        ))}
        <RecenterAutomatically selectedVillageData={selectedVillageData} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;