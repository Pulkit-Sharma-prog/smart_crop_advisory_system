import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = {
  latitude: number;
  longitude: number;
};

interface LocationPickerMapProps {
  value: LatLng;
  onChange: (next: LatLng) => void;
}

function ClickHandler({ onChange }: { onChange: (next: LatLng) => void }) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  return null;
}

function Recenter({ value }: { value: LatLng }) {
  const map = useMap();
  map.setView([value.latitude, value.longitude], map.getZoom(), { animate: true });
  return null;
}

export default function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border border-forest-200">
      <MapContainer
        center={[value.latitude, value.longitude]}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={[value.latitude, value.longitude]} radius={8} pathOptions={{ color: "#dc2626", fillColor: "#ef4444", fillOpacity: 0.75 }} />
        <ClickHandler onChange={onChange} />
        <Recenter value={value} />
      </MapContainer>
    </div>
  );
}
