/**
 * Default configuration for document-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxFileSizeBytes: 10485760,
  allowedMimeTypes: ["application/pdf","image/png","image/jpeg"],
  retentionDaysAfterDelete: 30,
  tenantStorageQuotaBytes: 1073741824,
};
