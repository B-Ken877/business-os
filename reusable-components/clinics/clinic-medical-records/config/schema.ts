/**
 * Configuration schema for clinic-medical-records.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Max characters per consultation note. */
  readonly maxNotesLengthChars: number;
}
