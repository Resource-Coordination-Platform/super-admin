"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { LocationPickerModal } from "@/components/features/location-picker-modal";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import type { TenantCreate, TenantSummary, TenantUpdate } from "@/lib/types";

export function TenantModal({
  open,
  onClose,
  tenant,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  tenant?: TenantSummary | null;
  onSuccess: () => void;
}) {
  const isEdit = !!tenant;
  const [submitting, setSubmitting] = React.useState(false);
  const [mapPickerOpen, setMapPickerOpen] = React.useState(false);
  const [selectedAddress, setSelectedAddress] = React.useState<string>("");

  // Form State
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [latitude, setLatitude] = React.useState<string>("");
  const [longitude, setLongitude] = React.useState<string>("");
  const [plan, setPlan] = React.useState("pro");
  const [durationDays, setDurationDays] = React.useState("30");
  const [contactEmail, setContactEmail] = React.useState("");

  // Admin Credentials (Only for new tenant)
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPhone, setAdminPhone] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");

  React.useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setSlug(tenant.slug);
      setDescription(tenant.description || "");
      setLatitude(tenant.latitude !== null ? String(tenant.latitude) : "");
      setLongitude(tenant.longitude !== null ? String(tenant.longitude) : "");
      setPlan(tenant.subscription_plan || "pro");
      setContactEmail(tenant.contact_email || "");
      setSelectedAddress("");
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setLatitude("");
      setLongitude("");
      setSelectedAddress("");
      setPlan("pro");
      setDurationDays("30");
      setContactEmail("");
      setAdminName("");
      setAdminEmail("");
      setAdminPhone("");
      setAdminPassword("");
    }
  }, [tenant, open]);

  // Auto slug generation on name change
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!isEdit) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        const body: TenantUpdate = {
          name: name.trim(),
          description: description.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          subscription_plan: plan,
          contact_email: contactEmail.trim() || undefined,
        };
        await api.patch(`/api/admin/tenants/${tenant.id}`, body);
        toast.success("Organization Updated", `Updated ${name} successfully.`);
      } else {
        const body: TenantCreate = {
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim() || undefined,
          subscription_plan: plan,
          subscription_duration_days: parseInt(durationDays, 10) || 30,
          contact_email: contactEmail.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          admin_full_name: adminName.trim(),
          admin_email: adminEmail.trim(),
          admin_phone: adminPhone.trim() || undefined,
          admin_password: adminPassword,
        };
        await api.post("/api/admin/tenants", body);
        toast.success(
          "Organization Onboarded",
          `Provisioned ${name} and created admin credentials.`,
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error("Operation Failed", err.detail);
      } else {
        toast.error("Operation Failed", "Could not complete request.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
      onClose={onClose}
      title={isEdit ? "Edit Organization" : "Onboard New Organization (CBO)"}
      description={
        isEdit
          ? "Update organization details, tier, and coordinates."
          : "Provision a new tenant hub with admin credentials and active subscription tier."
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Organization Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            1. Organization Profile
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organization Name" required>
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Galle Coastal Relief Hub"
                required
              />
            </Field>
            <Field label="Organization Slug" hint="Unique URL identifier" required>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. galle-relief"
                disabled={isEdit}
                required
              />
            </Field>
          </div>

          <Field label="Description / Mission">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the relief group, district coverage, or specialized capacity..."
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Email" hint="Public inquiry contact">
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@organization.lk"
              />
            </Field>
            <Field label="Subscription Plan Tier" required>
              <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="starter">Starter (Small Local Volunteer Group)</option>
                <option value="pro">Professional (Regional Crisis Response)</option>
                <option value="enterprise">Enterprise (National Coordination Network)</option>
                <option value="trial">14-Day Free Evaluation</option>
              </Select>
            </Field>
          </div>

          {!isEdit && (
            <Field label="Initial Subscription Duration" required>
              <Select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              >
                <option value="14">14 Days (Trial)</option>
                <option value="30">30 Days (1 Month)</option>
                <option value="90">90 Days (Quarterly)</option>
                <option value="180">180 Days (Half Year)</option>
                <option value="365">365 Days (1 Year)</option>
              </Select>
            </Field>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">
                  GIS Geographic Coordinates
                </span>
                <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">
                  (Used for platform disaster mapping)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMapPickerOpen(true)}
                className="flex items-center gap-1.5 text-xs text-brand-600 border-brand-200 bg-brand-50/70 hover:bg-brand-100 hover:text-brand-700 transition-colors shadow-2xs"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                Select on Map
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Latitude" hint="For GIS command map">
                <Input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="6.0535"
                />
              </Field>
              <Field label="Longitude" hint="For GIS command map">
                <Input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="80.2210"
                />
              </Field>
            </div>

            {latitude && longitude && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs">
                <div className="flex items-start gap-2 text-slate-600 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1 shrink-0" />
                  <div className="min-w-0">
                    <div>
                      Pinned: <strong className="font-mono text-slate-800">{latitude}, {longitude}</strong>
                    </div>
                    {selectedAddress && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5" title={selectedAddress}>
                        📍 {selectedAddress}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMapPickerOpen(true)}
                  className="text-[11px] font-medium text-brand-600 hover:text-brand-700 hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Adjust on Map →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Initial Administrator Setup (Only on create) */}
        {!isEdit && (
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              2. Initial Tenant Administrator Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Admin Full Name" required>
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Coordinator Fernando"
                  required
                />
              </Field>
              <Field label="Admin Email" hint="Login username" required>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="coordinator@organization.lk"
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Admin Phone">
                <Input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                />
              </Field>
              <Field label="Initial Password" hint="Minimum 8 characters" required>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={8}
                  required
                />
              </Field>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Save Changes" : "Create Organization"}
          </Button>
        </div>
      </form>
    </Modal>

    <LocationPickerModal
      open={mapPickerOpen}
      onClose={() => setMapPickerOpen(false)}
      initialLat={latitude ? parseFloat(latitude) : undefined}
      initialLng={longitude ? parseFloat(longitude) : undefined}
      initialAddress={selectedAddress}
      onSelect={(lat, lng, address) => {
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        if (address) setSelectedAddress(address);
      }}
    />
    </>
  );
}
