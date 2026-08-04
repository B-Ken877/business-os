/**
 * Configuration schema for church-events.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default event capacity. */
  readonly defaultCapacity: number;
  /** Whether to allow registration beyond capacity. */
  readonly allowOverRegistration: boolean;
}
