import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

function DonorMap({ center, donors }) {
  const mapCenter = {
    lat: Number(center.latitude) || 17.385,
    lng: Number(center.longitude) || 78.4867,
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <MapContainer center={mapCenter} zoom={10} className="h-80 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={mapCenter}>
          <Popup>Your location</Popup>
        </Marker>

        {donors.map((donor) => (
          <Marker
            key={donor.id}
            position={{ lat: Number(donor.latitude), lng: Number(donor.longitude) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{donor.name}</p>
                <p>{donor.bloodGroup}</p>
                <p>{donor.distanceKm} km away</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default DonorMap;
