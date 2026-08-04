/**
 * Configuration schema for church-groups.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on groups. */
  readonly maxGroupsPerTenant: number;
  /** Default max members per group. */
  readonly defaultMaxMembers: number;
}
