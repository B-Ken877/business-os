/**
 * HTTP-shaped API contract for school-exams.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Exam } from "../backend/types";
import type { CreateExamInput, MarkExamGradedInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-exams/create-exam",
    permission: "school.exams.manage",
    description: "Create a new exam period.",
  },
  {
    method: "PATCH",
    path: "/v1/school-exams/mark-exam-graded",
    permission: "school.exams.manage",
    description: "Mark an exam as fully graded.",
  },
];
