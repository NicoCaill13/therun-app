import { render } from "@testing-library/react-native";

import { RoutePolylinePreview } from "@/components/ui/RoutePolylinePreview";

describe("RoutePolylinePreview", () => {
  it("renders for a valid encoded polyline", () => {
    const { toJSON } = render(
      <RoutePolylinePreview encodedPolyline="_p~iF~ps|U" />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it("renders fallback for empty decoded path", () => {
    const { toJSON } = render(<RoutePolylinePreview encodedPolyline="" />);
    expect(toJSON()).not.toBeNull();
  });
});
