export type RouteEntityType = "ROUTE" | "TRAIL" | "MIXED";

export interface RouteLibraryItem {
  id: string;
  ownerId: string;
  name: string;
  encodedPolyline: string;
  distanceMeters: number;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  type: RouteEntityType | null;
  createdAt: string;
  updatedAt: string;
}

export interface RouteListResponse {
  items: RouteLibraryItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
