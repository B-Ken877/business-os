/**
 * Configuration schema for school-certificates.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default template key. */
  readonly certificateTemplateKey: string;
}
