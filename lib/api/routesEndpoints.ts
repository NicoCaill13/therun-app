import { apiGetJsonAuth } from "@/lib/api/authClient";
import type { RouteListResponse } from "@/lib/api/routesListTypes";

/** Wide enough to include any realistic route length (meters). */
const GLOBAL_DISTANCE_MAX_METERS = 100_000_000;

export interface ListRoutesParams {
  page?: number;
  pageSize?: number;
  /** When set, lists only routes owned by the current user. */
  createdByMe?: boolean;
  /** When true, lists community routes (requires premium + distance bounds on the API). */
  globalDiscovery?: boolean;
}

function buildListRoutesQuery(params: ListRoutesParams): string {
  const search = new URLSearchParams();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  search.set("page", String(page));
  search.set("pageSize", String(pageSize));

  if (params.createdByMe) {
    search.set("createdBy", "me");
  } else if (params.globalDiscovery) {
    search.set("distanceMin", "0");
    search.set("distanceMax", String(GLOBAL_DISTANCE_MAX_METERS));
  }

  return search.toString();
}

export async function listRoutes(
  params: ListRoutesParams,
  accessToken: string,
): Promise<RouteListResponse> {
  const qs = buildListRoutesQuery(params);
  const path = `/api/routes?${qs}`;
  return apiGetJsonAuth<RouteListResponse>(path, accessToken);
}
