import {
  Activity,
  Building2,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Platform KPIs & summary",
  },
  {
    label: "Tenants & CBOs",
    href: "/tenants",
    icon: Building2,
    description: "Organizations lifecycle",
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    description: "Plans & auto-expiry",
  },
  {
    label: "User Directory",
    href: "/users",
    icon: UsersRound,
    description: "Cross-platform accounts",
  },
  {
    label: "Super Admins",
    href: "/super-admins",
    icon: ShieldAlert,
    description: "Platform operators",
  },
  {
    label: "Infrastructure",
    href: "/infrastructure",
    icon: Activity,
    description: "Microservices health",
  },
];
