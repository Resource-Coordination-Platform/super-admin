"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/format";
import { NAV_ITEMS } from "./nav";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-slate-100 transition-transform lg:translate-x-0 border-r border-white/5 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 p-1 backdrop-blur shadow-md shadow-brand-600/30">
              <img
                src="/logo.png"
                alt="RCP Logo"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-tight">
                  RCP Platform
                </span>
                <span className="rounded bg-coral-500/20 px-1.5 py-0.2 text-[9px] font-bold text-coral-300 uppercase tracking-wider border border-coral-500/30">
                  HQ
                </span>
              </div>
              <p className="text-[11px] text-sidebar-muted font-medium">
                Super Admin Console
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-sidebar-hover hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
            Platform Management
          </p>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "liquid-glass group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "liquid-glass-active text-white font-semibold"
                    : "text-slate-300 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5 shrink-0 transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white",
                  )}
                />
                <span className="relative z-10 flex-1">{item.label}</span>
                {item.badge && (
                  <span className="relative z-10 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom indicator */}
        <div className="p-4 border-t border-white/5">
          <div className="rounded-xl bg-white/5 border border-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="h-4 w-4 text-coral-400" />
              <span>Multi-Tenant Engine</span>
            </div>
            <p className="mt-1 text-[11px] text-sidebar-muted">
              SaaS Infrastructure with automated lifecycle guards.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
