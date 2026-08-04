/**
 * Configuration schema for messaging-center.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Channel used when the caller does not specify one. */
  readonly defaultChannel: string;
  /** Hard cap on recipients per broadcast. */
  readonly maxBroadcastRecipients: number;
  /** Max messages per tenant per minute. */
  readonly rateLimitPerMinute: number;
  /** Whether to retry failed deliveries up to the channel's limit. */
  readonly retryFailedDeliveries: boolean;
}
