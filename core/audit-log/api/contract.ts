import type { RouteContract } from "@business-os/core/http/contract";

export const routes: readonly RouteContract[] = [
  {
    method: "GET",
    path: "/v1/audit-log",
    permission: "audit.read",
    description: "Query the audit log for the current tenant.",
  },
  {
    method: "GET",
    path: "/v1/audit-log/count",
    permission: "audit.read",
    description: "Count audit entries matching a query (for dashboards).",
  },
  {
    method: "GET",
    path: "/v1/audit-log/by-entity/{entityType}/{entityId}",
    permission: "audit.read",
    description: "List all audit entries for a specific entity.",
  },
];
