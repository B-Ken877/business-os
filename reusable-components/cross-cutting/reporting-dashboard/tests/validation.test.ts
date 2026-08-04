import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateDefineMetricInput,
  type DefineMetricInput,
  validateRecordMetricValueInput,
  type RecordMetricValueInput,
  validateGetMetricSeriesInput,
  type GetMetricSeriesInput,
} from "../backend/validation";

describe("reporting-dashboard / validateDefineMetricInput", () => {
  it("accepts a valid input", () => {
    const input: DefineMetricInput = {
    key: "value",
    name: "value",
    sourceQuery: "value",
    refreshIntervalSeconds: 1,
    };
    const r = validateDefineMetricInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when key is missing", () => {
    const input = {
      name: "value",
      sourceQuery: "value",
      refreshIntervalSeconds: 1,
    } as any;
    const r = validateDefineMetricInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when name is missing", () => {
    const input = {
      key: "value",
      sourceQuery: "value",
      refreshIntervalSeconds: 1,
    } as any;
    const r = validateDefineMetricInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sourceQuery is missing", () => {
    const input = {
      key: "value",
      name: "value",
      refreshIntervalSeconds: 1,
    } as any;
    const r = validateDefineMetricInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when refreshIntervalSeconds is missing", () => {
    const input = {
      key: "value",
      name: "value",
      sourceQuery: "value",
    } as any;
    const r = validateDefineMetricInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when refreshIntervalSeconds violates positive-integer", () => {
    const input = {
      key: "value",
      name: "value",
      sourceQuery: "value",
      refreshIntervalSeconds: -1,
    } as any;
    const r = validateDefineMetricInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("reporting-dashboard / validateRecordMetricValueInput", () => {
  it("accepts a valid input", () => {
    const input: RecordMetricValueInput = {
    metricKey: "value",
    windowStart: "2024-01-15",
    windowEnd: "2024-01-15",
    value: 0,
    };
    const r = validateRecordMetricValueInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when metricKey is missing", () => {
    const input = {
      windowStart: "2024-01-15",
      windowEnd: "2024-01-15",
      value: 0,
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowStart is missing", () => {
    const input = {
      metricKey: "value",
      windowEnd: "2024-01-15",
      value: 0,
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowEnd is missing", () => {
    const input = {
      metricKey: "value",
      windowStart: "2024-01-15",
      value: 0,
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when value is missing", () => {
    const input = {
      metricKey: "value",
      windowStart: "2024-01-15",
      windowEnd: "2024-01-15",
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowStart violates iso-date", () => {
    const input = {
      metricKey: "value",
      windowStart: "not-a-date",
      windowEnd: "2024-01-15",
      value: 0,
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowEnd violates iso-date", () => {
    const input = {
      metricKey: "value",
      windowStart: "2024-01-15",
      windowEnd: "not-a-date",
      value: 0,
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when value violates non-negative", () => {
    const input = {
      metricKey: "value",
      windowStart: "2024-01-15",
      windowEnd: "2024-01-15",
      value: -1,
    } as any;
    const r = validateRecordMetricValueInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("reporting-dashboard / validateGetMetricSeriesInput", () => {
  it("accepts a valid input", () => {
    const input: GetMetricSeriesInput = {
    metricKey: "value",
    windowStart: "2024-01-15",
    windowEnd: "2024-01-15",
    };
    const r = validateGetMetricSeriesInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when metricKey is missing", () => {
    const input = {
      windowStart: "2024-01-15",
      windowEnd: "2024-01-15",
    } as any;
    const r = validateGetMetricSeriesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowStart is missing", () => {
    const input = {
      metricKey: "value",
      windowEnd: "2024-01-15",
    } as any;
    const r = validateGetMetricSeriesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowEnd is missing", () => {
    const input = {
      metricKey: "value",
      windowStart: "2024-01-15",
    } as any;
    const r = validateGetMetricSeriesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowStart violates iso-date", () => {
    const input = {
      metricKey: "value",
      windowStart: "not-a-date",
      windowEnd: "2024-01-15",
    } as any;
    const r = validateGetMetricSeriesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when windowEnd violates iso-date", () => {
    const input = {
      metricKey: "value",
      windowStart: "2024-01-15",
      windowEnd: "not-a-date",
    } as any;
    const r = validateGetMetricSeriesInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
