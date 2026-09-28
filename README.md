# Resource Coordination Platform (RCP) — Super Admin Portal

Enterprise Command Center for Platform Super Administrators to govern the multi-tenant SaaS ecosystem for community disaster resilience (PID-9).

---

## Capabilities & Functions

### 1. Tenant & Organization Lifecycle Management
- **Onboard Organizations (CBOs)**: Add relief centers with custom slugs, mission descriptions, GIS spatial coordinates, and seed the initial tenant administrator account in a single atomic transaction.
- **Subscription Management**: Assign plans (`Starter`, `Professional`, `Enterprise`, `14-Day Free Evaluation`) and manage duration (14, 30, 90, 180, 365 days).
- **Auto-Suspension on Expiry**: Immediate identification of expired organizations. Platform-wide "Check & Suspend Expired" engine automatically revokes active user refresh tokens and deactivates the tenant.
- **Extend / Renew Subscriptions**: Flexible renewal by +14, +30, +90, +365 days or custom plan changes, with optional automatic reactivation.
- **Manual Suspend / Reactivate**: Immediate one-click lockout of compromised or inactive organizations.
- **Safe Tenant Deletion**: Complete cascading deletion of tenants, associated coordinators, role assignments, and session tokens with slug confirmation.

### 2. Cross-Platform Governance
- **Platform User Directory**: Global visibility across all actor populations (tenant admins, coordinators, global volunteers, victims, and donors).
- **Emergency Account Lockout**: Instantly ban or disable any user across any tenant or global pool.
- **Admin Password Resets**: Securely reset credentials for any user account.
- **Operator Provisioning**: Create and manage root platform Super Administrator accounts.

### 3. Spatial & Operational Monitoring
- **GIS Hub Command Center**: Interactive map displaying all registered relief hubs with real-time status pins (Green = Active, Amber = Expiring Soon, Red = Expired/Suspended).
- **Infrastructure Probes**: Real-time status, health, and latency monitoring across API Gateway (:8000), IAM (:8001), Logistics (:8002), Analytics (:8003), RTO WebSockets (:8080), PostgreSQL Database, and RabbitMQ Message Broker.

---

## Getting Started

### Prerequisites
- Node.js >= 20
- RCP API Gateway running on port `8000`

### Running the Portal

```bash
# 1. Start development server (runs on port 3001)
npm run dev

# 2. Production build and run
npm run build
npm run start
```

### Accessing the Portal
- **URL**: `http://localhost:3001`
- **Default Super Admin**: `chandupadilhan@gmail.com`
- Direct authentication via `/login` without requiring an organization slug.
