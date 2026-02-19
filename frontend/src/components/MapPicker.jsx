import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

function LocationSelector({ markerPosition, setMarkerPosition, onSelect, isInteractive }) {
  useMapEvents({
    click(event) {
      if (!isInteractive) return;
      const next = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      };
      setMarkerPosition(next);
      onSelect(next);
    },
  });

  return (
    <Marker
      position={markerPosition}
      draggable={isInteractive}
      eventHandlers={{
        dragend: (event) => {
          if (!isInteractive) return;
          const latlng = event.target.getLatLng();
          const next = { lat: latlng.lat, lng: latlng.lng };
          setMarkerPosition(next);
          onSelect(next);
        },
      }}
    />
  );
}

function MapViewUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

function MapPicker({ latitude, longitude, onSelect, isInteractive = true }) {
  const defaultCenter = useMemo(
    () => ({
      lat: Number(latitude) || 17.385,
      lng: Number(longitude) || 78.4867,
    }),
    [latitude, longitude],
  );

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  useEffect(() => {
    setMarkerPosition(defaultCenter);
  }, [defaultCenter]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <MapContainer center={defaultCenter} zoom={11} className="h-72 w-full">
        <MapViewUpdater center={defaultCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition}
          onSelect={onSelect}
          isInteractive={isInteractive}
        />
      </MapContainer>
    </div>
  );
}

export default MapPicker;
