/**
 * Domain types for the restaurant-menu component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// MenuItem
//////////////////////////////////////////////////////////////////////
/** A single menu item. */
export interface MenuItem {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Item name. */
  readonly name: string;
  /** Longer description. */
  readonly description: string | null;
  /** The menu category this item belongs to. */
  readonly categoryId: string;
  /** Base price. */
  readonly priceCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** JSON-serialised modifier definitions. */
  readonly modifiersJson: string | null;
  /** Document id of the item image. */
  readonly imageDocumentId: string | null;
  /** Whether the item is currently available (false = 86'd). */
  readonly available: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
