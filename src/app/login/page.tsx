"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  Sparkles,
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
    <div className="flex min-h-screen">
      {/* Left: Command Center Brand Showcase */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex border-r border-slate-800">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(60rem 60rem at 20% -10%, rgba(99,102,241,0.35), transparent), radial-gradient(50rem 50rem at 90% 110%, rgba(53,99,255,0.25), transparent)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-xl shadow-brand-500/30">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-wide">
                RCP Platform HQ
              </span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Platform Operator Command Center
            </p>
          </div>
        </div>

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-indigo-300 border border-slate-800 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Multi-Tenant Community Resilience SaaS</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Centralized platform oversight & tenant lifecycle operations.
          </h1>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            Provision relief organizations, manage subscription tiers, enforce
            automated expiry suspensions, and monitor platform health across all
            disaster zones.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              {
                icon: Building2,
                title: "Complete Tenant Lifecycle",
                desc: "Instant provisioning, suspend/unsuspend, and cascade delete.",
              },
              {
                icon: CalendarCheck2,
                title: "Automated Subscription Engine",
                desc: "Real-time expiration audits with automatic token revocation.",
              },
              {
                icon: ShieldAlert,
                title: "Platform-Wide Security",
                desc: "Global user pool governance, emergency lockouts, and credential resets.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3.5 rounded-xl bg-slate-900/60 p-3 border border-slate-800/80"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">{title}</p>
                  <p className="text-[11px] text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-900">
          <span>PID-9 · Disaster Resilience Infrastructure</span>
          <span>v1.0.0</span>
        </div>
      </div>

      {/* Right: Sign in Form */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">RCP Platform HQ</p>
              <p className="text-xs text-slate-500">Super Admin Portal</p>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Super Admin Sign In
            </h2>
            <p className="text-xs text-slate-500">
              Enter your platform operator credentials to access platform controls.
            </p>
          </div>

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
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-bold">Authentication Failed</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={submitting}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 font-semibold"
            >
              Sign In to Command Center
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 rounded-xl bg-slate-100 p-3.5 text-[11px] text-slate-500 text-center">
            🔒 This portal is restricted to authorized platform operators. Tenant administrators must access their dedicated organization portal.
          </div>
        </div>
      </div>
    </div>
  );
}
