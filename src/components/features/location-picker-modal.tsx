"use client";

import * as React from "react";
import { Check, MapPin, Navigation, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Input } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
}

const SRI_LANKA_PRESETS = [
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Kandy", lat: 7.2906, lng: 80.6337 },
  { name: "Galle", lat: 6.0535, lng: 80.221 },
  { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
  { name: "Matara", lat: 5.9549, lng: 80.555 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  { name: "Kurunegala", lat: 7.4863, lng: 80.3623 },
  { name: "Batticaloa", lat: 7.731, lng: 81.6747 },
];

export function LocationPickerModal({
  open,
  onClose,
  initialLat,
  initialLng,
  onSelect,
}: LocationPickerModalProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Default coordinates: Sri Lanka central coordinates or passed props
  const defaultLat = typeof initialLat === "number" && !isNaN(initialLat) ? initialLat : 6.9271;
  const defaultLng = typeof initialLng === "number" && !isNaN(initialLng) ? initialLng : 79.8612;

  const [selectedLat, setSelectedLat] = React.useState<number>(defaultLat);
  const [selectedLng, setSelectedLng] = React.useState<number>(defaultLng);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);

  // Sync state whenever modal opens or props change
  React.useEffect(() => {
    if (open) {
      const lat = typeof initialLat === "number" && !isNaN(initialLat) ? initialLat : 6.9271;
      const lng = typeof initialLng === "number" && !isNaN(initialLng) ? initialLng : 79.8612;
      setSelectedLat(lat);
      setSelectedLng(lng);
    }
  }, [open, initialLat, initialLng]);

  // Initialize or re-center Leaflet Map
  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapContainerRef.current) return;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      const initialZoom = initialLat && initialLng ? 13 : 8;
      const map = L.map(mapContainerRef.current).setView([selectedLat, selectedLng], initialZoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom sharp pin icon
      const customPin = L.divIcon({
        className: "custom-location-pin",
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            cursor: grab;
          ">
            <div style="
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              width: 34px;
              height: 34px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(29, 78, 216, 0.45);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
            <div style="
              width: 8px;
              height: 3px;
              background: rgba(0,0,0,0.3);
              border-radius: 50%;
              margin-top: 3px;
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      // Draggable marker
      const marker = L.marker([selectedLat, selectedLng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup("<b>Selected Hub Location</b><br/>Drag or click to adjust.").openPopup();

      // On marker drag
      marker.on("dragend", () => {
        if (!isMounted) return;
        const pos = marker.getLatLng();
        setSelectedLat(pos.lat);
        setSelectedLng(pos.lng);
      });

      // On map click
      map.on("click", (e: any) => {
        if (!isMounted) return;
        const { lat, lng } = e.latlng;
        setSelectedLat(lat);
        setSelectedLng(lng);
        marker.setLatLng([lat, lng]);
      });

      // Fix tile rendering when modal opens
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open]);

  // Jump to specific coordinate
  const jumpTo = React.useCallback((lat: number, lng: number, zoom = 14) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
  }, []);

  // Search location via preset or Nominatim API
  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Check local presets first
    const preset = SRI_LANKA_PRESETS.find((p) => p.name.toLowerCase().includes(query));
    if (preset) {
      jumpTo(preset.lat, preset.lng, 14);
      toast.success("Location Found", `Centered map on ${preset.name}.`);
      return;
    }

    // Query OpenStreetMap Nominatim for Sri Lanka
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ", Sri Lanka",
      )}&countrycodes=lk&limit=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        jumpTo(lat, lng, 14);
        toast.success("Location Found", data[0].display_name.split(",")[0]);
      } else {
        toast.error("Not Found", "Location could not be found. Please click directly on the map.");
      }
    } catch {
      toast.error("Search Error", "Could not complete location search.");
    } finally {
      setSearching(false);
    }
  }

  // Use Browser Geolocation
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Unsupported", "Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        jumpTo(pos.coords.latitude, pos.coords.longitude, 16);
        toast.success("Current Location Found", "Positioned to your GPS coordinates.");
      },
      () => {
        toast.error("Permission Denied", "Could not access your GPS location.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function handleConfirm() {
    onSelect(selectedLat, selectedLng);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select Hub Location on Map"
      description="Click anywhere on the map or drag the marker to pinpoint the organization's headquarters."
      maxWidth="max-w-3xl"
      zIndex="z-[60]"
    >
      <div className="space-y-4">
        {/* Search & Location Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search town, district, or address (e.g. Galle, Kandy, Negombo)..."
                className="pl-9 text-xs"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" loading={searching} className="shrink-0">
              Search
            </Button>
          </form>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUseMyLocation}
            className="flex items-center gap-1.5 shrink-0 text-xs text-brand-600 border-brand-200 hover:bg-brand-50"
          >
            <Navigation className="h-3.5 w-3.5" />
            My Location
          </Button>
        </div>

        {/* Quick City Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Jump:
          </span>
          {SRI_LANKA_PRESETS.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => jumpTo(city.lat, city.lng, 13)}
              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors shrink-0"
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Interactive Map Box */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
          <div ref={mapContainerRef} className="h-[380px] w-full z-10" />

          {/* Floating Instructions Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm border border-slate-200/80 text-[11px] font-medium text-slate-700 backdrop-blur-xs">
            <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
            <span>Click map or drag pin to position</span>
          </div>
        </div>

        {/* Selected Coordinates & Confirmation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Selected Coordinates:</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              className="flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              Use This Location
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
