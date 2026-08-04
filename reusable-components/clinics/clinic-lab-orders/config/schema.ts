/**
 * Configuration schema for clinic-lab-orders.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default expected turnaround. */
  readonly defaultResultTurnaroundHours: number;
}
