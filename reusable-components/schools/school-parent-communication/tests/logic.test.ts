import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemorySchoolParentCommunicationStore,
  sendParentMessage,
  listMessagesForStudent,
  defaultConfig,
  type ParentMessage,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolParentCommunicationStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.parent_comm.send",
    "school.parent_comm.read",
    "school.parent_comm.broadcast",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-parent-communication / sendParentMessage", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      sendParentMessage(ctx, denyDeps, { studentId: "ent_test", subject: "value", body: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-parent-communication / listMessagesForStudent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listMessagesForStudent(ctx, denyDeps, { studentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-parent-communication / send + list rules", () => {
  it("sends and lists messages for a student", () => {
    const { ctx, deps } = setup();
    sendParentMessage(ctx, deps, { studentId: "ent_s1", subject: "Meeting", body: "Please come to the school." });
    sendParentMessage(ctx, deps, { studentId: "ent_s1", subject: "Grades", body: "Your child passed." });
    sendParentMessage(ctx, deps, { studentId: "ent_s2", subject: "Other", body: "Other student." });
    const r = listMessagesForStudent(ctx, deps, { studentId: "ent_s1" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(2);
    // Both messages belong to ent_s1; the third (ent_s2) is excluded.
    const subjects = r.value.map((m) => m.subject).sort();
    expect(subjects).toEqual(["Grades", "Meeting"]);
  });
});
