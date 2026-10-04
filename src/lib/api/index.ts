/**
 * API facade — single import surface for the whole app.
 *
 * Backend integration checklist:
 * 1. Create `src/lib/api/liveApi.ts` with the same method signatures as `mockApi`.
 * 2. Set `NEXT_PUBLIC_USE_MOCK=false` in env.
 * 3. Delete or ignore `src/lib/mock/` once live data is stable.
 */
import { USE_MOCK } from "@/lib/constants";
import { mockApi, type ApiClient } from "@/lib/api/mockApi";

// import { liveApi } from "@/lib/api/liveApi";

export const api: ApiClient = USE_MOCK ? mockApi : mockApi;
// export const api: ApiClient = USE_MOCK ? mockApi : liveApi;

export type { ApiClient };
