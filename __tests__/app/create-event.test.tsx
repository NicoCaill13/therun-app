import type { ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import CreateEventScreen from "@/app/(app)/create-event";
import { postAddEventRoute } from "@/lib/api/eventRoutesEndpoints";
import { postCreateEvent } from "@/lib/api/eventsEndpoints";
import { listRoutes } from "@/lib/api/routesEndpoints";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import { pickAndBuildGpxRoute } from "@/lib/gpx/pickAndBuildGpxRoute";
import { showAppAlert } from "@/lib/showAppAlert";

jest.mock("@/lib/api/eventsEndpoints");
jest.mock("@/lib/api/eventRoutesEndpoints");
jest.mock("@/lib/api/routesEndpoints");
jest.mock("@/lib/auth/tokenStorage");
jest.mock("@/lib/gpx/pickAndBuildGpxRoute");
jest.mock("@/lib/showAppAlert");

const mockPostCreateEvent = postCreateEvent as jest.MockedFunction<typeof postCreateEvent>;
const mockPostAddEventRoute = postAddEventRoute as jest.MockedFunction<typeof postAddEventRoute>;
const mockListRoutes = listRoutes as jest.MockedFunction<typeof listRoutes>;
const mockPickAndBuildGpxRoute = pickAndBuildGpxRoute as jest.MockedFunction<
  typeof pickAndBuildGpxRoute
>;
const mockGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockShowAppAlert = showAppAlert as jest.MockedFunction<typeof showAppAlert>;

const SAMPLE_ROUTE_LIST = {
  items: [
    {
      id: "r1",
      ownerId: "u1",
      name: "Morning Loop",
      encodedPolyline: "_p~iF~ps|U",
      distanceMeters: 4200,
      centerLat: 52.5,
      centerLng: 13.4,
      radiusMeters: 800,
      type: "ROUTE" as const,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "r2",
      ownerId: "u1",
      name: "Evening",
      encodedPolyline: "_p~iF~ps|U",
      distanceMeters: 2100,
      centerLat: 52.5,
      centerLng: 13.4,
      radiusMeters: 400,
      type: "TRAIL" as const,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
  page: 1,
  pageSize: 50,
  totalCount: 2,
  totalPages: 1,
};

function renderWithQueryClient(ui: ReactElement): ReturnType<typeof render> {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("CreateEventScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowAppAlert.mockImplementation(() => {});
    mockGetAccessToken.mockResolvedValue("test-token");
    mockListRoutes.mockResolvedValue(SAMPLE_ROUTE_LIST);
    mockPickAndBuildGpxRoute.mockRejectedValue(new Error("pick not configured in this test"));
    mockPostAddEventRoute.mockResolvedValue({
      id: "er1",
      eventId: "evt1",
      routeId: "rt1",
      name: "GPX",
      distanceMeters: 1200,
      type: null,
      encodedPolyline: "abc",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockPostCreateEvent.mockResolvedValue({
      id: "evt1",
      title: "T",
      eventType: "BlaBlaRun",
      description: null,
      startDateTime: new Date().toISOString(),
      status: "PLANNED",
      organiserId: "u1",
      locationName: null,
      locationAddress: null,
      locationLat: null,
      locationLng: null,
      eventCode: "CODE1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("renders route hub actions and plan CTA", async () => {
    renderWithQueryClient(<CreateEventScreen />);
    await waitFor(() => expect(screen.getByTestId("create-event-route-library")).toBeTruthy());
    expect(screen.getByTestId("create-event-route-global")).toBeTruthy();
    expect(screen.getByTestId("create-event-gpx-upload")).toBeTruthy();
    expect(screen.getByLabelText("Plan the run")).toBeTruthy();
  });

  it("renders cancel control", () => {
    renderWithQueryClient(<CreateEventScreen />);
    expect(screen.getByLabelText("Cancel create event")).toBeTruthy();
  });

  it("opens target date calendar from the date field", () => {
    renderWithQueryClient(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-target-date"));
    expect(screen.getByTestId("event-date-cal-close")).toBeTruthy();
  });

  it("opens start time clock from the time field", () => {
    renderWithQueryClient(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-start-time"));
    expect(screen.getByTestId("event-time-clock-close")).toBeTruthy();
  });

  it("posts create event when title is set and token exists", async () => {
    renderWithQueryClient(<CreateEventScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText(/CHASE THE MIDNIGHT|URBAN MIDNIGHT SPRINT/),
      "Neon 10K",
    );
    fireEvent.press(screen.getByTestId("create-event-header-save"));
    await waitFor(() => expect(mockPostCreateEvent).toHaveBeenCalled());
    expect(mockPostCreateEvent.mock.calls[0][0]).toMatchObject({
      title: "Neon 10K",
      eventType: "BlaBlaRun",
    });
    expect(mockPostCreateEvent.mock.calls[0][0].startDateTime).toEqual(expect.any(String));
    expect(mockPostCreateEvent.mock.calls[0][1]).toBe("test-token");
  });

  it("sends selected event type in create payload", async () => {
    renderWithQueryClient(<CreateEventScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText(/CHASE THE MIDNIGHT|URBAN MIDNIGHT SPRINT/),
      "Trail night",
    );
    fireEvent.press(screen.getByTestId("create-event-type-TechnicalTrail"));
    fireEvent.press(screen.getByTestId("create-event-header-save"));
    await waitFor(() => expect(mockPostCreateEvent).toHaveBeenCalled());
    expect(mockPostCreateEvent.mock.calls[0][0].eventType).toBe("TechnicalTrail");
  });

  it("posts event route after create when GPX import succeeded", async () => {
    mockPickAndBuildGpxRoute.mockResolvedValue({
      fileName: "loop.gpx",
      displayName: "loop",
      encodedPolyline: "_p~iF~ps|U",
      distanceMeters: 2500,
      pointCount: 42,
    });
    renderWithQueryClient(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-gpx-upload"));
    await waitFor(() => expect(mockPickAndBuildGpxRoute).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("create-event-gpx-status")).toBeTruthy());
    expect(screen.getByTestId("create-event-route-preview-badge")).toBeTruthy();
    expect(screen.getByText("ROUTE PREVIEW")).toBeTruthy();
    fireEvent.changeText(
      screen.getByPlaceholderText(/CHASE THE MIDNIGHT|URBAN MIDNIGHT SPRINT/),
      "GPX Run",
    );
    fireEvent.press(screen.getByTestId("create-event-header-save"));
    await waitFor(() => expect(mockPostCreateEvent).toHaveBeenCalled());
    await waitFor(() => expect(mockPostAddEventRoute).toHaveBeenCalled());
    expect(mockPostAddEventRoute.mock.calls[0][0]).toBe("evt1");
    expect(mockPostAddEventRoute.mock.calls[0][1]).toMatchObject({
      mode: "NEW",
      encodedPolyline: "_p~iF~ps|U",
      name: "loop",
    });
    expect(mockPostAddEventRoute.mock.calls[0][2]).toBe("test-token");
  });

  it("shows feedback when title is missing", async () => {
    renderWithQueryClient(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-header-save"));
    await waitFor(() =>
      expect(mockShowAppAlert).toHaveBeenCalledWith("Cannot save", "Event title is required."),
    );
  });
});

describe("CreateEventScreen without user library routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowAppAlert.mockImplementation(() => {});
    mockGetAccessToken.mockResolvedValue("test-token");
    mockListRoutes.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 50,
      totalCount: 0,
      totalPages: 0,
    });
    mockPickAndBuildGpxRoute.mockRejectedValue(
      new Error("pick not configured in this test"),
    );
  });

  it("shows only global route hub when user library is empty", async () => {
    renderWithQueryClient(<CreateEventScreen />);
    await waitFor(() => expect(screen.queryByTestId("create-event-route-library")).toBeNull());
    expect(screen.getByTestId("create-event-route-global")).toBeTruthy();
  });
});
