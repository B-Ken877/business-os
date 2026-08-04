/**
 * Configuration schema for church-sermons.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on sermon records. */
  readonly maxSermonsPerTenant: number;
}
