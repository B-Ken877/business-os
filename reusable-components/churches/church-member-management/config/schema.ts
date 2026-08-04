/**
 * Configuration schema for church-member-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default visibility of a new member in the directory. */
  readonly defaultDirectoryVisibility: string;
  /** Cap on member records. */
  readonly maxMembersPerTenant: number;
}
