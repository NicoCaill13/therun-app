import { render, screen } from "@testing-library/react-native";

import RouteLibraryScreen from "@/app/(app)/route-library";

describe("RouteLibraryScreen", () => {
  it("renders library chrome and favorites in default mode", () => {
    render(<RouteLibraryScreen />);
    expect(screen.getByText("SELECT ROUTE")).toBeTruthy();
    expect(screen.getByTestId("route-library-tab-my")).toBeTruthy();
    expect(screen.getByText("FAVORITES")).toBeTruthy();
    expect(screen.getByTestId("route-library-card-1")).toBeTruthy();
  });

  it("exposes navigation controls", () => {
    render(<RouteLibraryScreen />);
    expect(screen.getByTestId("route-library-back")).toBeTruthy();
    expect(screen.getByTestId("route-library-fab-close")).toBeTruthy();
  });
});
