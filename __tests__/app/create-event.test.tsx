import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import CreateEventScreen from "@/app/(app)/create-event";
import { postAddEventRoute } from "@/lib/api/eventRoutesEndpoints";
import { postCreateEvent } from "@/lib/api/eventsEndpoints";
import { getAccessToken } from "@/lib/auth/tokenStorage";
import { pickAndBuildGpxRoute } from "@/lib/gpx/pickAndBuildGpxRoute";
import { showAppAlert } from "@/lib/showAppAlert";

jest.mock("@/lib/api/eventsEndpoints");
jest.mock("@/lib/api/eventRoutesEndpoints");
jest.mock("@/lib/auth/tokenStorage");
jest.mock("@/lib/gpx/pickAndBuildGpxRoute");
jest.mock("@/lib/showAppAlert");

const mockPostCreateEvent = postCreateEvent as jest.MockedFunction<typeof postCreateEvent>;
const mockPostAddEventRoute = postAddEventRoute as jest.MockedFunction<typeof postAddEventRoute>;
const mockPickAndBuildGpxRoute = pickAndBuildGpxRoute as jest.MockedFunction<
  typeof pickAndBuildGpxRoute
>;
const mockGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockShowAppAlert = showAppAlert as jest.MockedFunction<typeof showAppAlert>;

describe("CreateEventScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowAppAlert.mockImplementation(() => {});
    mockGetAccessToken.mockResolvedValue("test-token");
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

  it("renders route hub actions and plan CTA", () => {
    render(<CreateEventScreen />);
    expect(screen.getByTestId("create-event-route-library")).toBeTruthy();
    expect(screen.getByTestId("create-event-route-global")).toBeTruthy();
    expect(screen.getByTestId("create-event-gpx-upload")).toBeTruthy();
    expect(screen.getByLabelText("Plan the run")).toBeTruthy();
  });

  it("renders cancel control", () => {
    render(<CreateEventScreen />);
    expect(screen.getByLabelText("Cancel create event")).toBeTruthy();
  });

  it("opens target date calendar from the date field", () => {
    render(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-target-date"));
    expect(screen.getByTestId("event-date-cal-close")).toBeTruthy();
  });

  it("opens start time clock from the time field", () => {
    render(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-start-time"));
    expect(screen.getByTestId("event-time-clock-close")).toBeTruthy();
  });

  it("posts create event when title is set and token exists", async () => {
    render(<CreateEventScreen />);
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
    render(<CreateEventScreen />);
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
    render(<CreateEventScreen />);
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
    render(<CreateEventScreen />);
    fireEvent.press(screen.getByTestId("create-event-header-save"));
    await waitFor(() =>
      expect(mockShowAppAlert).toHaveBeenCalledWith("Cannot save", "Event title is required."),
    );
  });
});
