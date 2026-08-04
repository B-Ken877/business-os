/**
 * Default configuration for notes-and-comments.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxNoteLength: 5000,
  maxThreadDepth: 5,
};
