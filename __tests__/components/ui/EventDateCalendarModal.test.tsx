import { fireEvent, render, screen } from "@testing-library/react-native";

import { EventDateCalendarModal } from "@/components/ui/EventDateCalendarModal";

describe("EventDateCalendarModal", () => {
  it("renders navigation and close when visible", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const value = new Date(2026, 3, 7, 12, 0, 0, 0);

    render(
      <EventDateCalendarModal
        visible
        value={value}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByTestId("event-date-cal-prev")).toBeTruthy();
    expect(screen.getByTestId("event-date-cal-next")).toBeTruthy();
    expect(screen.getByTestId("event-date-cal-close")).toBeTruthy();
  });

  it("calls onSelect and onClose when a day is chosen", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();
    const value = new Date(2026, 3, 1, 12, 0, 0, 0);

    render(
      <EventDateCalendarModal
        visible
        value={value}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByTestId("event-date-cal-day-15"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    const picked = onSelect.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(3);
    expect(picked.getDate()).toBe(15);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
