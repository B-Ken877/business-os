import type { RouteContract } from "@business-os/core/http/contract";

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/organizations",
    permission: "authenticated",
    description: "Create a new organization. The creator becomes the owner.",
  },
  {
    method: "GET",
    path: "/v1/organizations/mine",
    permission: "authenticated",
    description: "List organizations the current user is a member of.",
  },
  {
    method: "POST",
    path: "/v1/organizations/{orgId}/invitations",
    permission: "organization.invite",
    description: "Invite a user to join an organization.",
  },
  {
    method: "POST",
    path: "/v1/organizations/invitations/accept",
    permission: "authenticated",
    description: "Accept an invitation using the token from the email.",
  },
  {
    method: "DELETE",
    path: "/v1/organizations/{orgId}/memberships/{membershipId}",
    permission: "organization.manage_members",
    description: "Revoke a user's membership in an organization.",
  },
  {
    method: "GET",
    path: "/v1/organizations/by-slug/{slug}",
    permission: "public",
    description: "Resolve an organization by slug (used for tenant resolution).",
  },
];
