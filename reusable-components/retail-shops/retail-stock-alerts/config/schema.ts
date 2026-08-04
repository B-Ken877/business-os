/**
 * Configuration schema for retail-stock-alerts.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Hours to suppress a duplicate alert for the same product. */
  readonly suppressDuplicateHours: number;
  /** Role whose members receive alerts. */
  readonly alertRecipientRole: string;
}
