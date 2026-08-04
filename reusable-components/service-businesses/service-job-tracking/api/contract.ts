/**
 * HTTP-shaped API contract for service-job-tracking.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Job, JobTask } from "../backend/types";
import type { CreateJobInput, AddTaskInput, CompleteTaskInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-job-tracking/create-job",
    permission: "service.jobs.manage",
    description: "Create a new job.",
  },
  {
    method: "POST",
    path: "/v1/service-job-tracking/add-task",
    permission: "service.jobs.manage",
    description: "Add a task to a job.",
  },
  {
    method: "POST",
    path: "/v1/service-job-tracking/complete-task",
    permission: "service.jobs.update_task",
    description: "Mark a task as completed. If all tasks are complete, the job is auto-completed.",
  },
];
