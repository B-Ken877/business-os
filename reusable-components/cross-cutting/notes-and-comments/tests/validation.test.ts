import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateNoteInput,
  type CreateNoteInput,
  validateListNotesForEntityInput,
  type ListNotesForEntityInput,
  validateDeleteNoteInput,
  type DeleteNoteInput,
} from "../backend/validation";

describe("notes-and-comments / validateCreateNoteInput", () => {
  it("accepts a valid input", () => {
    const input: CreateNoteInput = {
    body: "value",
    entityType: "value",
    entityId: "ent_test",
    parentId: undefined,
    visibility: "internal",
    };
    const r = validateCreateNoteInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when body is missing", () => {
    const input = {
      entityType: "value",
      entityId: "ent_test",
      parentId: undefined,
      visibility: "internal",
    } as any;
    const r = validateCreateNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityType is missing", () => {
    const input = {
      body: "value",
      entityId: "ent_test",
      parentId: undefined,
      visibility: "internal",
    } as any;
    const r = validateCreateNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityId is missing", () => {
    const input = {
      body: "value",
      entityType: "value",
      parentId: undefined,
      visibility: "internal",
    } as any;
    const r = validateCreateNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when visibility is missing", () => {
    const input = {
      body: "value",
      entityType: "value",
      entityId: "ent_test",
      parentId: undefined,
    } as any;
    const r = validateCreateNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when visibility violates enum:internal|visible_to_customer", () => {
    const input = {
      body: "value",
      entityType: "value",
      entityId: "ent_test",
      parentId: undefined,
      visibility: "__invalid__",
    } as any;
    const r = validateCreateNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("notes-and-comments / validateListNotesForEntityInput", () => {
  it("accepts a valid input", () => {
    const input: ListNotesForEntityInput = {
    entityType: "value",
    entityId: "ent_test",
    };
    const r = validateListNotesForEntityInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when entityType is missing", () => {
    const input = {
      entityId: "ent_test",
    } as any;
    const r = validateListNotesForEntityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when entityId is missing", () => {
    const input = {
      entityType: "value",
    } as any;
    const r = validateListNotesForEntityInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("notes-and-comments / validateDeleteNoteInput", () => {
  it("accepts a valid input", () => {
    const input: DeleteNoteInput = {
    noteId: "ent_test",
    };
    const r = validateDeleteNoteInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when noteId is missing", () => {
    const input = {
    } as any;
    const r = validateDeleteNoteInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
