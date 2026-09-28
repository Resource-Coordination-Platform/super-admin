export type UserType =
  | "SUPER_ADMIN"
  | "TENANT_ADMIN"
  | "COORDINATOR"
  | "VOLUNTEER"
  | "VICTIM"
  | "DONATOR";

export type Role =
  | "super_admin"
  | "tenant_admin"
  | "coordinator"
  | "volunteer"
  | "victim"
  | "donator";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  tenant_id?: string | null;
}

export interface JwtClaims {
  sub: string;
  user_type: UserType;
  roles: Role[];
  tenant_id: string | null;
  exp: number;
  iat: number;
}

export interface UserRead {
  id: string;
  tenant_id: string | null;
  user_type: UserType;
  email: string;
  full_name: string;
  phone: string | null;
  status: string;
  roles: Role[];
  created_at?: string;
}

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "active" | "suspended";
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  subscription_plan: string | null;
  subscription_end: string | null;
  contact_email: string | null;
  is_subscription_expired: boolean;
  days_remaining: number | null;
  user_count: number;
  admin_count: number;
  coordinator_count: number;
}

export interface TenantCreate {
  name: string;
  slug: string;
  description?: string;
  subscription_plan: string;
  subscription_duration_days: number;
  subscription_end?: string;
  contact_email?: string;
  latitude?: number;
  longitude?: number;
  admin_email: string;
  admin_password: string;
  admin_full_name: string;
  admin_phone?: string;
}

export interface TenantUpdate {
  name?: string;
  description?: string;
  status?: "active" | "suspended";
  subscription_plan?: string;
  subscription_end?: string;
  latitude?: number;
  longitude?: number;
  contact_email?: string;
}

export interface TenantRenewRequest {
  plan?: string;
  extend_days: number;
  auto_activate: boolean;
}

export interface SubscriptionCheckResponse {
  checked_count: number;
  suspended_count: number;
  suspended_tenants: string[];
}

export interface AdminUserRead {
  id: string;
  tenant_id: string | null;
  tenant_slug: string | null;
  user_type: UserType;
  email: string;
  full_name: string;
  phone: string | null;
  status: "active" | "disabled";
  roles: Role[];
  created_at: string;
}

export interface UserTypeCount {
  user_type: string;
  count: number;
}

export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  expired_tenants: number;
  expiring_soon_tenants: number;
  total_users: number;
  global_users: number;
  tenant_users: number;
  super_admins: number;
  users_by_type: UserTypeCount[];
  tenants_last_30d: number;
  users_last_30d: number;
}

export interface SuperAdminCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface ServiceHealthStatus {
  status: string;
  service: string;
  latency_ms?: number;
}

export interface PlatformReadiness {
  status: string;
  services: Record<string, { status: string; service?: string }>;
}
