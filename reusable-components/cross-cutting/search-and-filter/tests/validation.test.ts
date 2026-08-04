import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRunQueryInput,
  type RunQueryInput,
  validateSaveQueryInput,
  type SaveQueryInput,
} from "../backend/validation";

describe("search-and-filter / validateRunQueryInput", () => {
  it("accepts a valid input", () => {
    const input: RunQueryInput = {
    entityType: "value",
    queryText: undefined,
    pageSize: 1,
    cursor: undefined,
    sortField: undefined,
    sortDirection: "asc",
    };
    const r = validateRunQueryInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when entityType is missing", () => {
    const input = {
      queryText: undefined,
      pageSize: 1,
      cursor: undefined,
      sortField: undefined,
      sortDirection: "asc",
    } as any;
    const r = validateRunQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when pageSize is missing", () => {
    const input = {
      entityType: "value",
      queryText: undefined,
      cursor: undefined,
      sortField: undefined,
      sortDirection: "asc",
    } as any;
    const r = validateRunQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sortDirection is missing", () => {
    const input = {
      entityType: "value",
      queryText: undefined,
      pageSize: 1,
      cursor: undefined,
      sortField: undefined,
    } as any;
    const r = validateRunQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when pageSize violates positive-integer", () => {
    const input = {
      entityType: "value",
      queryText: undefined,
      pageSize: -1,
      cursor: undefined,
      sortField: undefined,
      sortDirection: "asc",
    } as any;
    const r = validateRunQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sortDirection violates enum:asc|desc", () => {
    const input = {
      entityType: "value",
      queryText: undefined,
      pageSize: 1,
      cursor: undefined,
      sortField: undefined,
      sortDirection: "__invalid__",
    } as any;
    const r = validateRunQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("search-and-filter / validateSaveQueryInput", () => {
  it("accepts a valid input", () => {
    const input: SaveQueryInput = {
    name: "value",
    entityType: "value",
    queryText: undefined,
    sortField: undefined,
    sortDirection: "asc",
    };
    const r = validateSaveQueryInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when name is missing", () => {
    const input = {
      entityType: "value",
      queryText: undefined,
      sortField: undefined,
      sortDirection: "asc",
    } as any;
    const r = validateSaveQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityType is missing", () => {
    const input = {
      name: "value",
      queryText: undefined,
      sortField: undefined,
      sortDirection: "asc",
    } as any;
    const r = validateSaveQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sortDirection is missing", () => {
    const input = {
      name: "value",
      entityType: "value",
      queryText: undefined,
      sortField: undefined,
    } as any;
    const r = validateSaveQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when sortDirection violates enum:asc|desc", () => {
    const input = {
      name: "value",
      entityType: "value",
      queryText: undefined,
      sortField: undefined,
      sortDirection: "__invalid__",
    } as any;
    const r = validateSaveQueryInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
