import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateCreateJobInput,
  type CreateJobInput,
  validateAddTaskInput,
  type AddTaskInput,
  validateCompleteTaskInput,
  type CompleteTaskInput,
} from "../backend/validation";

describe("service-job-tracking / validateCreateJobInput", () => {
  it("accepts a valid input", () => {
    const input: CreateJobInput = {
    customerId: "ent_test",
    title: "value",
    bookingId: undefined,
    };
    const r = validateCreateJobInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when customerId is missing", () => {
    const input = {
      title: "value",
      bookingId: undefined,
    } as any;
    const r = validateCreateJobInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when title is missing", () => {
    const input = {
      customerId: "ent_test",
      bookingId: undefined,
    } as any;
    const r = validateCreateJobInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-job-tracking / validateAddTaskInput", () => {
  it("accepts a valid input", () => {
    const input: AddTaskInput = {
    jobId: "ent_test",
    title: "value",
    order: 1,
    };
    const r = validateAddTaskInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when jobId is missing", () => {
    const input = {
      title: "value",
      order: 1,
    } as any;
    const r = validateAddTaskInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when title is missing", () => {
    const input = {
      jobId: "ent_test",
      order: 1,
    } as any;
    const r = validateAddTaskInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when order is missing", () => {
    const input = {
      jobId: "ent_test",
      title: "value",
    } as any;
    const r = validateAddTaskInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when order violates positive-integer", () => {
    const input = {
      jobId: "ent_test",
      title: "value",
      order: -1,
    } as any;
    const r = validateAddTaskInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("service-job-tracking / validateCompleteTaskInput", () => {
  it("accepts a valid input", () => {
    const input: CompleteTaskInput = {
    taskId: "ent_test",
    };
    const r = validateCompleteTaskInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when taskId is missing", () => {
    const input = {
    } as any;
    const r = validateCompleteTaskInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
