/** Configuration schema for core/identity. */
export interface IdentityConfig {
  /** Session lifetime in seconds. */
  readonly sessionLifetimeSeconds: number;
  /** Idle timeout in seconds. */
  readonly idleTimeoutSeconds: number;
}
