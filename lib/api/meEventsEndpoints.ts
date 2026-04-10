import { apiGetJsonAuth } from "@/lib/api/authClient";
import type { MeEventsListResponse, MeEventsScope } from "@/lib/api/meEventsTypes";

export interface ListMyEventsParams {
  scope: MeEventsScope;
  page?: number;
  pageSize?: number;
}

export async function listMyEvents(
  params: ListMyEventsParams,
  accessToken: string,
): Promise<MeEventsListResponse> {
  const search = new URLSearchParams();
  search.set("scope", params.scope);
  if (typeof params.page === "number") {
    search.set("page", String(params.page));
  }
  if (typeof params.pageSize === "number") {
    search.set("pageSize", String(params.pageSize));
  }
  const path = `/api/me/events?${search.toString()}`;
  return apiGetJsonAuth<MeEventsListResponse>(path, accessToken);
}
