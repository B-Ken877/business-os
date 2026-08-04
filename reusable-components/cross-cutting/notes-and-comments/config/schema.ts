/**
 * Configuration schema for notes-and-comments.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Maximum characters per note body. */
  readonly maxNoteLength: number;
  /** Maximum nesting depth for threaded replies. */
  readonly maxThreadDepth: number;
}
