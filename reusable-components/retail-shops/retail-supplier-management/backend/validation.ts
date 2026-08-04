/**
 * Input validation helpers for the retail-supplier-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateSupplierInput(input: CreateSupplierInput): Result<CreateSupplierInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.paymentTermsDays === undefined || input.paymentTermsDays === null) {
    return err(ErrorCode.INVALID_INPUT, "paymentTermsDays is required");
  }
  if (!Number.isInteger(input.paymentTermsDays) || input.paymentTermsDays < 0) {
    return err(ErrorCode.INVALID_INPUT, "paymentTermsDays must be a non-negative integer");
  }
  return ok(input);
}

export function validateCreatePurchaseOrderInput(input: CreatePurchaseOrderInput): Result<CreatePurchaseOrderInput> {
  if (input.supplierId === undefined || input.supplierId === null || (typeof input.supplierId === "string" && input.supplierId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "supplierId is required");
  }
  if (input.itemsJson === undefined || input.itemsJson === null || (typeof input.itemsJson === "string" && input.itemsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "itemsJson is required");
  }
  if (input.totalCents === undefined || input.totalCents === null) {
    return err(ErrorCode.INVALID_INPUT, "totalCents is required");
  }
  if (!Number.isInteger(input.totalCents) || input.totalCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "totalCents must be a non-negative integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  return ok(input);
}

export function validateMarkPurchaseOrderReceivedInput(input: MarkPurchaseOrderReceivedInput): Result<MarkPurchaseOrderReceivedInput> {
  if (input.purchaseOrderId === undefined || input.purchaseOrderId === null || (typeof input.purchaseOrderId === "string" && input.purchaseOrderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "purchaseOrderId is required");
  }
  return ok(input);
}

export interface CreateSupplierInput {
  readonly name: string;
  readonly contactName?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
  readonly paymentTermsDays: number;
}

export interface CreatePurchaseOrderInput {
  readonly supplierId: string;
  readonly itemsJson: string;
  readonly totalCents: number;
  readonly currency: string;
}

export interface MarkPurchaseOrderReceivedInput {
  readonly purchaseOrderId: string;
}
