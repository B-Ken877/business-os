/**
 * Input validation helpers for the restaurant-kitchen-display component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateTicketInput(input: CreateTicketInput): Result<CreateTicketInput> {
  if (input.orderId === undefined || input.orderId === null || (typeof input.orderId === "string" && input.orderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "orderId is required");
  }
  if (input.itemsJson === undefined || input.itemsJson === null || (typeof input.itemsJson === "string" && input.itemsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "itemsJson is required");
  }
  if (input.station === undefined || input.station === null || (typeof input.station === "string" && input.station.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "station is required");
  }
  if (input.priority === undefined || input.priority === null) {
    return err(ErrorCode.INVALID_INPUT, "priority is required");
  }
  if (!Number.isInteger(input.priority) || input.priority < 0) {
    return err(ErrorCode.INVALID_INPUT, "priority must be a non-negative integer");
  }
  return ok(input);
}

export function validateMarkTicketReadyInput(input: MarkTicketReadyInput): Result<MarkTicketReadyInput> {
  if (input.ticketId === undefined || input.ticketId === null || (typeof input.ticketId === "string" && input.ticketId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "ticketId is required");
  }
  return ok(input);
}

export function validateListTicketsForStationInput(input: ListTicketsForStationInput): Result<ListTicketsForStationInput> {
  if (input.station === undefined || input.station === null || (typeof input.station === "string" && input.station.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "station is required");
  }
  return ok(input);
}

export interface CreateTicketInput {
  readonly orderId: string;
  readonly itemsJson: string;
  readonly station: string;
  readonly priority: number;
}

export interface MarkTicketReadyInput {
  readonly ticketId: string;
}

export interface ListTicketsForStationInput {
  readonly station: string;
}
