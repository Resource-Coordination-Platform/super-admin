"use client";

import * as React from "react";
import { Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { StatusBadge, SubscriptionPlanBadge } from "@/components/ui/badges";
import type { TenantSummary } from "@/lib/types";

export function TenantGISMap({ tenants }: { tenants: TenantSummary[] }) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const [selectedTenant, setSelectedTenant] = React.useState<TenantSummary | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapContainerRef.current) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Sri Lanka coordinates
      const map = L.map(mapContainerRef.current).setView([7.8731, 80.7718], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add markers
      const validTenants = tenants.filter(
        (t) => typeof t.latitude === "number" && typeof t.longitude === "number",
      );

      validTenants.forEach((t) => {
        let pinColor = "#10b981"; // active = emerald
        if (t.status === "suspended") {
          pinColor = "#e11d48"; // suspended = rose
        } else if (t.is_subscription_expired) {
          pinColor = "#f59e0b"; // expired = amber
        }

        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="
              background-color: ${pinColor};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 11px;
            ">
              ★
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([t.latitude!, t.longitude!], {
          icon: customIcon,
        }).addTo(map);

        marker.on("click", () => {
          if (isMounted) setSelectedTenant(t);
        });
      });
    }

    void initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [tenants]);

  const locatedCount = tenants.filter(
    (t) => typeof t.latitude === "number" && typeof t.longitude === "number",
  ).length;

  return (
    <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-card">
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-md backdrop-blur-xs border border-slate-200 text-xs text-slate-700">
        <MapPin className="h-4 w-4 text-brand-600" />
        <span className="font-semibold">{locatedCount}</span> of {tenants.length} Hubs Geocoded
      </div>

      <div ref={mapContainerRef} className="h-[400px] w-full z-10" />

      {selectedTenant && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-20 animate-scale-in">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-elevated backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {selectedTenant.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    slug: {selectedTenant.slug}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <StatusBadge
                status={selectedTenant.status}
                isExpired={selectedTenant.is_subscription_expired}
              />
              <SubscriptionPlanBadge plan={selectedTenant.subscription_plan} />
            </div>

            <p className="mt-2 text-xs text-slate-600 line-clamp-2">
              {selectedTenant.description || "Community-based relief coordination hub."}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
              <span>Staff: {selectedTenant.user_count} users</span>
              <span>
                {selectedTenant.days_remaining !== null
                  ? `${selectedTenant.days_remaining}d left`
                  : "No expiry"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
