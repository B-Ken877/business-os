/**
 * HTTP-shaped API contract for notifications-center.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Notification } from "../backend/types";
import type { PushNotificationInput, MarkReadInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/notifications-center/push-notification",
    permission: "notifications.push",
    description: "Push a notification to a user's inbox.",
  },
  {
    method: "GET",
    path: "/v1/notifications-center/list-unread-for-current-user",
    permission: "notifications.read",
    description: "List all unread, non-expired, non-dismissed notifications for the current user.",
  },
  {
    method: "PATCH",
    path: "/v1/notifications-center/mark-read",
    permission: "notifications.read",
    description: "Mark a notification as read.",
  },
];
