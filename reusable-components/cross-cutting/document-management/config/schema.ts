/**
 * Configuration schema for document-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Hard cap on a single file's size (10 MB default). */
  readonly maxFileSizeBytes: number;
  /** MIME types accepted by default. */
  readonly allowedMimeTypes: ReadonlyArray<string>;
  /** Days a soft-deleted document is kept before hard purge. */
  readonly retentionDaysAfterDelete: number;
  /** Per-tenant storage cap (1 GB default). */
  readonly tenantStorageQuotaBytes: number;
}
