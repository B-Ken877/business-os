/**
 * HTTP contract types — used by every core module's api/contract.ts to
 * declare its routes. The actual HTTP server (a future core/http module)
 * will read these declarations and wire them to handlers.
 *
 * This is types-only — no framework dependency — so it works with any
 * runtime (Hono, Express, Next.js API routes, Cloudflare Workers).
 */

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  /**
   * The permission required to call this route. Special values:
   *   - "public": no auth required (bootstrapping routes like register/login).
   *   - "authenticated": any logged-in user.
   *   - otherwise: a specific permission string like "retail.products.create".
   */
  readonly permission: string;
  readonly description: string;
}

/**
 * The shape of a request handler. A handler receives a typed request
 * and returns a typed response. The future core/http module will provide
 * adapters that turn this into framework-specific handlers.
 */
export interface RequestHandler<Req = unknown, Res = unknown> {
  (req: HttpRequest<Req>): Promise<HttpResponse<Res>>;
}

export interface HttpRequest<T = unknown> {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, string>>;
  readonly body: T;
  /** The authenticated user, if any. Null for public routes. */
  readonly userId: string | null;
  /** The resolved tenant, if any. Null for platform-wide routes. */
  readonly tenantId: string | null;
}

export interface HttpResponse<T = unknown> {
  readonly status: number;
  readonly body: T;
}
