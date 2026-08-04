/**
 * Configuration schema for roles-and-permissions-ui.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default role assigned when a new user is invited. */
  readonly defaultRoleOnInvite: string;
  /** Whether the owner role can be edited through this UI (default: no). */
  readonly allowOwnerRoleEditing: boolean;
}
