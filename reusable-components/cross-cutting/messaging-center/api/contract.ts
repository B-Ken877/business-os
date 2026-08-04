/**
 * HTTP-shaped API contract for messaging-center.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Message } from "../backend/types";
import type { SendMessageInput, MarkDeliveredInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/messaging-center/send-message",
    permission: "messaging.messages.send",
    description: "Send a message to a single recipient through a channel.",
  },
  {
    method: "PATCH",
    path: "/v1/messaging-center/mark-delivered",
    permission: "messaging.messages.read",
    description: "Mark a queued or sent message as delivered. Called by the channel adapter on delivery confirmation.",
  },
  {
    method: "GET",
    path: "/v1/messaging-center/list-messages",
    permission: "messaging.messages.read",
    description: "List all messages for the current tenant, newest first.",
  },
];
