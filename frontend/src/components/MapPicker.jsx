import { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

function LocationSelector({ markerPosition, setMarkerPosition, onSelect }) {
  useMapEvents({
    click(event) {
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
      draggable
      eventHandlers={{
        dragend: (event) => {
          const latlng = event.target.getLatLng();
          const next = { lat: latlng.lat, lng: latlng.lng };
          setMarkerPosition(next);
          onSelect(next);
        },
      }}
    />
  );
}

function MapPicker({ latitude, longitude, onSelect }) {
  const defaultCenter = useMemo(
    () => ({
      lat: Number(latitude) || 17.385,
      lng: Number(longitude) || 78.4867,
    }),
    [latitude, longitude],
  );

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <MapContainer center={defaultCenter} zoom={11} className="h-72 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector
          markerPosition={markerPosition}
          setMarkerPosition={setMarkerPosition}
          onSelect={onSelect}
        />
      </MapContainer>
    </div>
  );
}

export default MapPicker;
