/** Default configuration for core/identity. */
import type { IdentityConfig } from "./schema";

export const defaultIdentityConfig: IdentityConfig = {
  sessionLifetimeSeconds: 7 * 24 * 3600, // 7 days
  idleTimeoutSeconds: 30 * 60, // 30 minutes
};
