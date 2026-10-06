/**
 * Single application data boundary. Screens import `api` only.
 * Milestone 2 can supply a live adapter implementing ApiClient and replace
 * this assignment without touching screen components or the sample data.
 */
import { mockApi, type ApiClient } from "@/lib/api/mockApi";

export const api: ApiClient = mockApi;
export type { ApiClient };
