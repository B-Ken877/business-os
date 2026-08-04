/**
 * Configuration schema for school-student-portal.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Whether students can reply to parent messages. */
  readonly allowStudentMessageReply: boolean;
}
