import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateRecordSermonInput,
  type RecordSermonInput,
  validateListSermonsBySpeakerInput,
  type ListSermonsBySpeakerInput,
} from "../backend/validation";

describe("church-sermons / validateRecordSermonInput", () => {
  it("accepts a valid input", () => {
    const input: RecordSermonInput = {
    title: "value",
    speakerMemberId: "value",
    deliveredAt: "2024-01-15",
    scriptureReferences: undefined,
    seriesId: undefined,
    };
    const r = validateRecordSermonInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when title is missing", () => {
    const input = {
      speakerMemberId: "value",
      deliveredAt: "2024-01-15",
      scriptureReferences: undefined,
      seriesId: undefined,
    } as any;
    const r = validateRecordSermonInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when speakerMemberId is missing", () => {
    const input = {
      title: "value",
      deliveredAt: "2024-01-15",
      scriptureReferences: undefined,
      seriesId: undefined,
    } as any;
    const r = validateRecordSermonInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when deliveredAt is missing", () => {
    const input = {
      title: "value",
      speakerMemberId: "value",
      scriptureReferences: undefined,
      seriesId: undefined,
    } as any;
    const r = validateRecordSermonInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when deliveredAt violates iso-date", () => {
    const input = {
      title: "value",
      speakerMemberId: "value",
      deliveredAt: "not-a-date",
      scriptureReferences: undefined,
      seriesId: undefined,
    } as any;
    const r = validateRecordSermonInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("church-sermons / validateListSermonsBySpeakerInput", () => {
  it("accepts a valid input", () => {
    const input: ListSermonsBySpeakerInput = {
    speakerMemberId: "value",
    };
    const r = validateListSermonsBySpeakerInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when speakerMemberId is missing", () => {
    const input = {
    } as any;
    const r = validateListSermonsBySpeakerInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
