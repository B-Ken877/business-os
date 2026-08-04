/**
 * Input validation helpers for the reporting-dashboard component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateDefineMetricInput(input: DefineMetricInput): Result<DefineMetricInput> {
  if (input.key === undefined || input.key === null || (typeof input.key === "string" && input.key.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "key is required");
  }
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.sourceQuery === undefined || input.sourceQuery === null || (typeof input.sourceQuery === "string" && input.sourceQuery.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "sourceQuery is required");
  }
  if (input.refreshIntervalSeconds === undefined || input.refreshIntervalSeconds === null) {
    return err(ErrorCode.INVALID_INPUT, "refreshIntervalSeconds is required");
  }
  if (!Number.isInteger(input.refreshIntervalSeconds) || input.refreshIntervalSeconds <= 0) {
    return err(ErrorCode.INVALID_INPUT, "refreshIntervalSeconds must be a positive integer");
  }
  return ok(input);
}

export function validateRecordMetricValueInput(input: RecordMetricValueInput): Result<RecordMetricValueInput> {
  if (input.metricKey === undefined || input.metricKey === null || (typeof input.metricKey === "string" && input.metricKey.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "metricKey is required");
  }
  if (input.windowStart === undefined || input.windowStart === null) {
    return err(ErrorCode.INVALID_INPUT, "windowStart is required");
  }
  if (typeof input.windowStart !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.windowStart)) {
    return err(ErrorCode.INVALID_INPUT, "windowStart must be an ISO-8601 date");
  }
  if (input.windowEnd === undefined || input.windowEnd === null) {
    return err(ErrorCode.INVALID_INPUT, "windowEnd is required");
  }
  if (typeof input.windowEnd !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.windowEnd)) {
    return err(ErrorCode.INVALID_INPUT, "windowEnd must be an ISO-8601 date");
  }
  if (input.value === undefined || input.value === null) {
    return err(ErrorCode.INVALID_INPUT, "value is required");
  }
  if (typeof input.value !== "number" || input.value < 0) {
    return err(ErrorCode.INVALID_INPUT, "value must be non-negative");
  }
  return ok(input);
}

export function validateGetMetricSeriesInput(input: GetMetricSeriesInput): Result<GetMetricSeriesInput> {
  if (input.metricKey === undefined || input.metricKey === null || (typeof input.metricKey === "string" && input.metricKey.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "metricKey is required");
  }
  if (input.windowStart === undefined || input.windowStart === null) {
    return err(ErrorCode.INVALID_INPUT, "windowStart is required");
  }
  if (typeof input.windowStart !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.windowStart)) {
    return err(ErrorCode.INVALID_INPUT, "windowStart must be an ISO-8601 date");
  }
  if (input.windowEnd === undefined || input.windowEnd === null) {
    return err(ErrorCode.INVALID_INPUT, "windowEnd is required");
  }
  if (typeof input.windowEnd !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.windowEnd)) {
    return err(ErrorCode.INVALID_INPUT, "windowEnd must be an ISO-8601 date");
  }
  return ok(input);
}

export interface DefineMetricInput {
  readonly key: string;
  readonly name: string;
  readonly sourceQuery: string;
  readonly refreshIntervalSeconds: number;
}

export interface RecordMetricValueInput {
  readonly metricKey: string;
  readonly windowStart: string;
  readonly windowEnd: string;
  readonly value: number;
}

export interface GetMetricSeriesInput {
  readonly metricKey: string;
  readonly windowStart: string;
  readonly windowEnd: string;
}
