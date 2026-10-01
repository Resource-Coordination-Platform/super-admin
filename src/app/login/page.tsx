"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Lock,
  Mail,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui/primitives";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("Unable to reach the API Gateway. Verify server is running.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #fff7f2 0%, #ffe8d9 25%, #fff1eb 50%, #ffecd6 75%, #fff5ee 100%)",
      }}
    >
      {/* Left: Command Center Brand Showcase */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(60rem 60rem at 20% -10%, rgba(11,114,97,0.40), transparent), radial-gradient(50rem 50rem at 90% 110%, rgba(11,114,97,0.25), transparent)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 p-1.5 backdrop-blur shadow-lg shadow-brand-600/40">
            <img
              src="/logo.png"
              alt="RCP Logo"
              className="h-full w-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-base text-white">
                Sahasra Resource Coordination Platform
              </p>
              <span className="rounded bg-coral-500/20 px-2 py-0.5 text-[10px] font-bold text-coral-300 uppercase tracking-wider border border-coral-500/30">
                HQ
              </span>
            </div>
            <p className="text-xs text-sidebar-muted">
              Platform Operator Command Center
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Centralized platform oversight & disaster resilience operations.
          </h1>
          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            Provision relief organizations, manage subscription tiers, enforce
            automated expiry suspensions, and monitor platform health across all
            disaster zones.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                icon: Building2,
                text: "Complete organization & tenant lifecycle",
              },
              {
                icon: CalendarCheck2,
                text: "Automated subscription & expiry engine",
              },
              {
                icon: ShieldCheck,
                text: "Platform-wide security & emergency lockouts",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-brand-300" />
                </div>
                <span className="text-sm text-slate-200">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-400">
          Multi-tenant SaaS · Event-driven · Offline-first
        </p>
      </div>

      {/* Right: Sign in Form */}
      <div
        className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2"
        style={{
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        }}
      >
        <div className="glass-card w-full max-w-sm rounded-2xl p-8">
          {/* Brand header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 p-1.5 ring-1 ring-brand-200 shadow-sm">
              <img
                src="/logo.png"
                alt="RCP Logo"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-lg leading-tight">
                RCP Platform HQ
              </p>
              <p className="text-xs text-muted-foreground">
                Platform Operator Portal
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Super Admin Sign In
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter platform operator credentials to access platform controls.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Operator Email" required>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@rcp.platform.lk"
                  required
                  autoFocus
                />
                <Mail className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Password" required>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
                <Lock className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            {error && (
              <div className="glass-toast rounded-xl border border-red-200 bg-red-50 text-red-700 p-3.5 text-sm flex items-start gap-2.5 shadow-sm">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider">
                    Authentication Failed
                  </p>
                  <p className="text-xs mt-0.5 opacity-90">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={submitting}
              className="w-full"
            >
              Sign In to Command Center
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-[11px] text-amber-900/90 text-center">
            🔒 This portal is restricted to authorized platform operators. Tenant
            administrators must access their dedicated organization portal.
          </div>
        </div>
      </div>
    </div>
  );
}
