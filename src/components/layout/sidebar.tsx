"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Sparkles, X } from "lucide-react";
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-slate-100 transition-transform lg:translate-x-0 border-r border-slate-800/80 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-18 items-center justify-between px-5 border-b border-slate-800/60">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-lg shadow-brand-500/30">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-wide">
                  RCP Platform
                </span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                  HQ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Super Admin Console
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-6">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                  "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-200",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-brand-500/30 px-2 py-0.5 text-[10px] font-semibold text-brand-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom indicator */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span>Multi-Tenant Engine</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              SaaS Infrastructure with automated lifecycle guards.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
