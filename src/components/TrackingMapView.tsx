import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLanguage } from "../LanguageContext";
import { Vehicle, Driver, Trip } from "../types";
import PageHeader from "./ui/PageHeader";
import { Navigation, Compass } from "lucide-react";

interface TrackingMapViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
}

const CITY_COORDS: Record<string, [number, number]> = {
  Bengaluru: [12.9716, 77.5946],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.3850, 78.4867],
  Mumbai: [19.0760, 72.8777],
  Pune: [18.5204, 73.8567],
  Delhi: [28.6139, 77.2090],
  Jaipur: [26.9124, 75.7873]
};

export default function TrackingMapView({
  vehicles,
  drivers,
  trips
}: TrackingMapViewProps) {
  const { t, language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0.35); // simulated trip progress

  // Simulate vehicle movements
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedProgress((prev) => {
        const next = prev + 0.005;
        return next > 1.0 ? 0.0 : next; // Reset back to start
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not exists
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; CartoDB',
        maxZoom: 18
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapRef.current = map;
    }

    const map = mapRef.current;

    // Filter active trips (DISPATCHED status)
    const activeTrips = trips.filter(t => t.status === "DISPATCHED");

    // Remove obsolete markers and lines
    Object.keys(markersRef.current).forEach((id) => {
      if (!activeTrips.some(t => t.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    Object.keys(polylinesRef.current).forEach((id) => {
      if (!activeTrips.some(t => t.id === id)) {
        polylinesRef.current[id].remove();
        delete polylinesRef.current[id];
      }
    });

    // Plot/update active trips
    activeTrips.forEach((trip) => {
      const startCoord = CITY_COORDS[trip.source] || [12.9716, 77.5946];
      const endCoord = CITY_COORDS[trip.destination] || [13.0827, 80.2707];

      // Draw path line if not exist
      if (!polylinesRef.current[trip.id]) {
        const polyline = L.polyline([startCoord, endCoord], {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.6,
          dashArray: "6, 6"
        }).addTo(map);
        polylinesRef.current[trip.id] = polyline;
      }

      // Interpolate current simulated location
      const currentLat = startCoord[0] + (endCoord[0] - startCoord[0]) * simulatedProgress;
      const currentLng = startCoord[1] + (endCoord[1] - startCoord[1]) * simulatedProgress;
      const currentLoc: [number, number] = [currentLat, currentLng];

      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.id === trip.driverId);

      const regNo = vehicle?.registrationNumber || "N/A";
      const driverName = driver?.name || "N/A";

      // Render custom DivIcon
      const markerHtml = `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-700 shadow-lg bg-blue-600 animate-pulse-ring" style="background-color: #2563eb;">
          <span style="font-size: 14px; line-height: 1;">🚚</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Update or create marker
      if (markersRef.current[trip.id]) {
        markersRef.current[trip.id].setLatLng(currentLoc);
      } else {
        const marker = L.marker(currentLoc, { icon: customIcon }).addTo(map);
        markersRef.current[trip.id] = marker;
      }

      // Update popup content
      const popupHtml = `
        <div class="font-sans p-1 text-slate-300" style="min-width: 180px;">
          <div class="font-bold text-sm text-blue-600 flex items-center gap-1.5 mb-1">
            🚚 ${regNo}
          </div>
          <div class="text-xs space-y-1">
            <div><strong>Operator:</strong> ${driverName}</div>
            <div><strong>Route:</strong> ${trip.source} → ${trip.destination}</div>
            <div><strong>Simulated ETA:</strong> ${Math.round((1 - simulatedProgress) * 4)} hrs remaining</div>
            <div><strong>Cargo:</strong> ${trip.cargoWeightKg.toLocaleString()} kg</div>
          </div>
        </div>
      `;
      markersRef.current[trip.id].bindPopup(popupHtml);
    });

  }, [trips, vehicles, drivers, simulatedProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title={language === "ta" ? "நேரடி வரைபட கண்காணிப்பு" : language === "es" ? "Mapa de Seguimiento en Vivo" : "Live Tracking Map"}
        subtitle={language === "ta" ? "செயலில் உள்ள பயணங்கள் மற்றும் வாகன நிலைகளின் நிகழ்நேர கண்காணிப்பு" : language === "es" ? "Monitoreo en tiempo real de viajes activos y posiciones de vehículos" : "Real-time monitoring of active trips and vehicle telemetry"}
        actionSlot={
          <div className="flex items-center gap-2 bg-blue-50/20 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs text-xs font-semibold shrink-0">
            <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin duration-3000" />
            <span>Telemetry Stream Active</span>
          </div>
        }
      />

      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/50 relative">
        {/* Leaflet Container */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-[550px] z-10"
        />

        {/* Floating Legends */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg text-slate-200 text-xs font-sans space-y-2">
          <div className="font-bold text-sm text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Navigation className="w-4 h-4 text-blue-500" /> Control Console
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block animate-pulse" />
            <span>Active Dispatch Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">🚚</span>
            <span>Simulated Telemetry Tracker</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            Click markers to view manifest details.
          </div>
        </div>
      </div>
    </div>
  );
}
