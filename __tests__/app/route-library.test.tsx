import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react-native";

import RouteLibraryScreen from "@/app/(app)/route-library";
import { getMeProfile } from "@/lib/api/meProfileEndpoints";
import { listRoutes } from "@/lib/api/routesEndpoints";
import { getAccessToken } from "@/lib/auth/tokenStorage";

jest.mock("@/lib/api/meProfileEndpoints");
jest.mock("@/lib/api/routesEndpoints");
jest.mock("@/lib/auth/tokenStorage");

const mockGetMeProfile = getMeProfile as jest.MockedFunction<typeof getMeProfile>;
const mockListRoutes = listRoutes as jest.MockedFunction<typeof listRoutes>;
const mockGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;

const PREMIUM_PROFILE = {
  id: "u1",
  email: "a@b.c",
  firstName: "Alex",
  lastName: null,
  displayName: "Alex",
  isGuest: false,
  plan: "PREMIUM" as const,
  planSince: null,
  planUntil: null,
  acceptedTermsAt: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  planBenefits: {
    maxActiveEventsPerWeek: -1,
    globalRouteLibraryAccess: true,
    description: "Premium",
  },
};

const SAMPLE_ROUTE = {
  id: "r1",
  ownerId: "u1",
  name: "City loop",
  encodedPolyline: "_p~iF~ps|U",
  distanceMeters: 3200,
  centerLat: 52.5,
  centerLng: 13.4,
  radiusMeters: 600,
  type: "ROUTE" as const,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

function renderRouteLibrary(ui: ReactElement): ReturnType<typeof render> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("RouteLibraryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue("tok");
    mockGetMeProfile.mockResolvedValue(PREMIUM_PROFILE);
    mockListRoutes.mockImplementation(async (params) => {
      if (params.createdByMe) {
        return {
          items: [SAMPLE_ROUTE],
          page: 1,
          pageSize: 50,
          totalCount: 1,
          totalPages: 1,
        };
      }
      return {
        items: [],
        page: 1,
        pageSize: 50,
        totalCount: 0,
        totalPages: 0,
      };
    });
  });

  it("renders library chrome and first route card in default mode", async () => {
    renderRouteLibrary(<RouteLibraryScreen />);
    expect(screen.getByText("SELECT ROUTE")).toBeTruthy();
    expect(screen.getByTestId("route-library-tab-my")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("MY ROUTES")).toBeTruthy());
    await waitFor(() => expect(screen.getByTestId("route-library-card-1")).toBeTruthy());
  });

  it("exposes navigation controls", () => {
    renderRouteLibrary(<RouteLibraryScreen />);
    expect(screen.getByTestId("route-library-back")).toBeTruthy();
    expect(screen.getByTestId("route-library-fab-close")).toBeTruthy();
  });
});
