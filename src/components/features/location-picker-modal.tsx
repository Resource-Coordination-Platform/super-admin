"use client";

import * as React from "react";
import { Check, Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Input } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onSelect: (lat: number, lng: number, address?: string) => void;
}

interface PhotonFeature {
  type: string;
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    countrycode?: string;
    type?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
}

const SRI_LANKA_PRESETS = [
  { name: "Colombo", lat: 6.9271, lng: 79.8612, desc: "Western Province" },
  { name: "Kandy", lat: 7.2906, lng: 80.6337, desc: "Central Province" },
  { name: "Galle", lat: 6.0535, lng: 80.221, desc: "Southern Province" },
  { name: "Jaffna", lat: 9.6615, lng: 80.0255, desc: "Northern Province" },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152, desc: "Eastern Province" },
  { name: "Matara", lat: 5.9549, lng: 80.555, desc: "Southern Province" },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037, desc: "North Central" },
  { name: "Kurunegala", lat: 7.4863, lng: 80.3623, desc: "North Western" },
  { name: "Batticaloa", lat: 7.731, lng: 81.6747, desc: "Eastern Province" },
];

function formatAddress(props: PhotonFeature["properties"]): {
  title: string;
  subtitle: string;
  full: string;
} {
  const title = props.name || props.street || "Location";
  const items = [
    props.housenumber,
    props.name !== props.street ? props.street : undefined,
    props.district,
    props.city,
    props.county,
    props.state,
    props.countrycode === "LK" ? "Sri Lanka" : props.country,
  ].filter(Boolean);

  const unique = items.filter((p, i) => items.indexOf(p) === i && p !== title);
  const subtitle = unique.join(", ");
  const full = subtitle ? `${title}, ${subtitle}` : title;

  return { title, subtitle, full };
}

export function LocationPickerModal({
  open,
  onClose,
  initialLat,
  initialLng,
  initialAddress,
  onSelect,
}: LocationPickerModalProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  const defaultLat = typeof initialLat === "number" && !isNaN(initialLat) ? initialLat : 6.9271;
  const defaultLng = typeof initialLng === "number" && !isNaN(initialLng) ? initialLng : 79.8612;

  const [selectedLat, setSelectedLat] = React.useState<number>(defaultLat);
  const [selectedLng, setSelectedLng] = React.useState<number>(defaultLng);
  const [currentAddress, setCurrentAddress] = React.useState<string>(initialAddress || "");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<PhotonFeature[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [resolvingAddress, setResolvingAddress] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  // Sync state on open
  React.useEffect(() => {
    if (open) {
      const lat = typeof initialLat === "number" && !isNaN(initialLat) ? initialLat : 6.9271;
      const lng = typeof initialLng === "number" && !isNaN(initialLng) ? initialLng : 79.8612;
      setSelectedLat(lat);
      setSelectedLng(lng);
      setCurrentAddress(initialAddress || "");
      setSearchQuery(initialAddress || "");
      setShowDropdown(false);
      setIsTyping(false);
    }
  }, [open, initialLat, initialLng, initialAddress]);

  // Click outside search container to close dropdown
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reverse Geocoding when coordinates change (by click or drag)
  const fetchAddressForCoordinates = React.useCallback(async (lat: number, lng: number) => {
    setResolvingAddress(true);
    try {
      const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feat = data.features[0] as PhotonFeature;
        const { full, title } = formatAddress(feat.properties);
        setCurrentAddress(full);

        if (markerRef.current) {
          markerRef.current
            .bindPopup(
              `<div style="font-size: 12px; line-height: 1.4; padding: 2px;">
                <strong style="color: #1e293b; font-size: 13px;">${title}</strong><br/>
                <span style="color: #475569;">${full}</span><br/>
                <span style="color: #2563eb; font-family: monospace; font-size: 11px; margin-top: 4px; display: inline-block;">
                  ${lat.toFixed(5)}, ${lng.toFixed(5)}
                </span>
              </div>`,
            )
            .openPopup();
        }
      } else {
        const fallback = `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setCurrentAddress(fallback);
      }
    } catch {
      // Keep previous or fallback
    } finally {
      setResolvingAddress(false);
    }
  }, []);

  // Initialize Leaflet Map
  React.useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      const initialZoom = initialLat && initialLng ? 14 : 8;
      const map = L.map(mapContainerRef.current).setView([selectedLat, selectedLng], initialZoom);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Icon
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
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
            <div style="
              width: 10px;
              height: 4px;
              background: rgba(0,0,0,0.3);
              border-radius: 50%;
              margin-top: 3px;
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([selectedLat, selectedLng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      // Initial address reverse lookup if not already set
      if (initialLat && initialLng && !initialAddress) {
        void fetchAddressForCoordinates(initialLat, initialLng);
      } else if (initialAddress) {
        marker
          .bindPopup(
            `<div style="font-size: 12px;"><b>${initialAddress}</b><br/>${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}</div>`,
          )
          .openPopup();
      }

      // On Marker Drag
      marker.on("dragend", () => {
        if (!isMounted) return;
        const pos = marker.getLatLng();
        setSelectedLat(pos.lat);
        setSelectedLng(pos.lng);
        void fetchAddressForCoordinates(pos.lat, pos.lng);
      });

      // On Map Click
      map.on("click", (e: any) => {
        if (!isMounted) return;
        const { lat, lng } = e.latlng;
        setSelectedLat(lat);
        setSelectedLng(lng);
        marker.setLatLng([lat, lng]);
        void fetchAddressForCoordinates(lat, lng);
      });

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
  }, [open, fetchAddressForCoordinates]);

  // Jump to specific coordinate & address
  const jumpToLocation = React.useCallback(
    (lat: number, lng: number, addressText?: string, zoom = 15) => {
      setSelectedLat(lat);
      setSelectedLng(lng);
      if (addressText) {
        setCurrentAddress(addressText);
        setSearchQuery(addressText);
      }
      setShowDropdown(false);
      setIsTyping(false);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        if (addressText) {
          markerRef.current
            .bindPopup(
              `<div style="font-size: 12px; line-height: 1.4;">
                <strong style="color: #1e293b;">${addressText}</strong><br/>
                <span style="color: #2563eb; font-family: monospace;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
              </div>`,
            )
            .openPopup();
        }
      }
    },
    [],
  );

  // Live Autocomplete Debounced Search
  React.useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isTyping || trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const query = encodeURIComponent(trimmed);
        // Prioritize Sri Lanka coordinates (lat 7.8731, lon 80.7718)
        const url = `https://photon.komoot.io/api/?q=${query}&lat=7.8731&lon=80.7718&limit=8`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        if (data.features && Array.isArray(data.features)) {
          // Sort Sri Lanka results to the top
          const lk = data.features.filter((f: PhotonFeature) => f.properties.countrycode === "LK");
          const others = data.features.filter(
            (f: PhotonFeature) => f.properties.countrycode !== "LK",
          );
          const combined = [...lk, ...others].slice(0, 6);
          setSuggestions(combined);
          setShowDropdown(combined.length > 0);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchQuery, isTyping]);

  // Form submit search (e.g. hitting Enter)
  async function handleSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions.length > 0) {
      const top = suggestions[0];
      const [lng, lat] = top.geometry.coordinates;
      const { full } = formatAddress(top.properties);
      jumpToLocation(lat, lng, full);
      toast.success("Location Pinpointed", full);
      return;
    }

    // Try explicit search
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=7.8731&lon=80.7718&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feat = data.features[0];
        const [lng, lat] = feat.geometry.coordinates;
        const { full } = formatAddress(feat.properties);
        jumpToLocation(lat, lng, full);
        toast.success("Location Found", full);
      } else {
        toast.error("Address Not Found", "Try entering a city or landmark, or click on the map.");
      }
    } catch {
      toast.error("Search Error", "Could not complete address lookup.");
    } finally {
      setSearching(false);
    }
  }

  // Use GPS Location
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Unsupported", "Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        jumpToLocation(lat, lng, undefined, 16);
        void fetchAddressForCoordinates(lat, lng);
        toast.success("GPS Positioned", "Centered on your current device location.");
      },
      () => {
        toast.error("Access Denied", "Could not retrieve GPS coordinates.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function handleConfirm() {
    onSelect(selectedLat, selectedLng, currentAddress || undefined);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Find Hub Location by Address or Map"
      description="Type an address to search with instant suggestions, or click and drag the pin on the map."
      maxWidth="max-w-3xl"
      zIndex="z-[60]"
    >
      <div className="space-y-4">
        {/* Address Search with Live Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative z-30">
          <form onSubmit={handleSubmitSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsTyping(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Enter street, landmark, city, or address (e.g. Galle Road, Kandy)..."
                className="pl-9 pr-10 text-xs shadow-xs focus:ring-brand-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searching && <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />}
                {searchQuery && !searching && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowDropdown(false);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              variant="primary"
              loading={searching}
              className="shrink-0 text-xs px-3"
            >
              Find
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleUseMyLocation}
              className="flex items-center gap-1.5 shrink-0 text-xs text-brand-600 border-brand-200 hover:bg-brand-50"
              title="Use Device GPS"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">My Location</span>
            </Button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-40 max-h-60 overflow-y-auto animate-scale-in">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Address Suggestions ({suggestions.length})
              </div>
              <ul className="divide-y divide-slate-100">
                {suggestions.map((item, idx) => {
                  const { title, subtitle } = formatAddress(item.properties);
                  const [lng, lat] = item.geometry.coordinates;

                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => {
                          const { full } = formatAddress(item.properties);
                          jumpToLocation(lat, lng, full);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-brand-50/70 transition-colors flex items-start gap-2.5 group cursor-pointer"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-brand-700">
                            {title}
                          </p>
                          {subtitle && (
                            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
                          )}
                        </div>
                        {item.properties.type && (
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 capitalize">
                            {item.properties.type}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Quick City Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Major Hubs:
          </span>
          {SRI_LANKA_PRESETS.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => jumpToLocation(city.lat, city.lng, `${city.name}, ${city.desc}`)}
              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors shrink-0 cursor-pointer"
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Interactive Map Box */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
          <div ref={mapContainerRef} className="h-[360px] w-full z-10" />

          {/* Floating Instructions Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-sm border border-slate-200/80 text-[11px] font-medium text-slate-700 backdrop-blur-xs">
            <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
            <span>Click map or drag marker to reposition</span>
          </div>
        </div>

        {/* Selected Address & Confirmation Bar */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Resolved Address Pill */}
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs">
            <MapPin className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-slate-500 font-medium">Selected Location / Address:</span>
              <p className="font-semibold text-slate-800 break-words mt-0.5">
                {resolvingAddress ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> Resolving address...
                  </span>
                ) : (
                  currentAddress || "Custom Coordinates Location"
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">GPS</span>
              <span className="font-mono text-xs font-bold text-slate-700">
                {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
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
