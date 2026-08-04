/**
 * Configuration schema for activity-timeline.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on events stored per entity; older events are archived. */
  readonly maxEventsPerEntity: number;
  /** Maximum characters for an event's summary field. */
  readonly summaryMaxLength: number;
}
