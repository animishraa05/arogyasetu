import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

import { FeatureCollection, Feature } from 'geojson';

interface InteractiveMapProps {
  geojson: FeatureCollection; // This will be the GeoJSON data for the map
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ geojson }) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON>(null);

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const stateName = feature.properties.NAME_1; // Assuming 'NAME_1' is the state name property

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7,
        });
        setHoveredState(stateName);
      },
      mouseout: (e) => {
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.resetStyle(e.target);
        }
        setHoveredState(null);
      },
      click: (e) => {
        // Handle click event, e.g., zoom to state or show more info
        console.log(`Clicked on state: ${stateName}`);
      },
    });
  };

  const style = (feature: any) => {
    return {
      fillColor: '#ADD8E6', // Light blue default color
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.5,
    };
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[26.2006, 92.9376]} // Center of North East India
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geojson && (
          <GeoJSON
            data={geojson}
            style={style}
            onEachFeature={onEachFeature}
            ref={geoJsonLayerRef}
          />
        )}
      </MapContainer>
      {hoveredState && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-md z-[1000]">
          <p className="font-semibold">{hoveredState}</p>
          {/* Add cultural icon and key statistic here */}
          <p className="text-sm">Cultural Icon: 🌸</p>
          <p className="text-sm">ASHA Workers: 1200+</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;