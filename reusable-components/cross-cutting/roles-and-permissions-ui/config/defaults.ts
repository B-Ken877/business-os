/**
 * Default configuration for roles-and-permissions-ui.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultRoleOnInvite: "member",
  allowOwnerRoleEditing: false,
};
