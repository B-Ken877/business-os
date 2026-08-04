/** Configuration schema for core/organizations. */
export interface OrganizationsConfig {
  /** Hours before an invitation expires. */
  readonly invitationExpiryHours: number;
  /** Maximum active members per organization. */
  readonly maxMembersPerOrganization: number;
}
