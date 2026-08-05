import type { OrganizationsConfig } from "./schema";

export const defaultOrganizationsConfig: OrganizationsConfig = {
  invitationExpiryHours: 24 * 7, // 7 days
  maxMembersPerOrganization: 100,
};
