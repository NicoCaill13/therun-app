import { fireEvent, render, screen } from "@testing-library/react-native";

import { EventTimeClockModal } from "@/components/ui/EventTimeClockModal";

describe("EventTimeClockModal", () => {
  it("commits preview time when Done is pressed", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();

    render(
      <EventTimeClockModal
        visible
        value={{ hours: 22, minutes: 0 }}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByTestId("event-time-clock-close"));
    expect(onSelect).toHaveBeenCalledWith({ hours: 22, minutes: 0 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("commits after toggling AM or PM and pressing Done", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();

    render(
      <EventTimeClockModal
        visible
        value={{ hours: 22, minutes: 0 }}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByTestId("event-time-clock-am"));
    fireEvent.press(screen.getByTestId("event-time-clock-close"));

    expect(onSelect).toHaveBeenCalledWith({ hours: 10, minutes: 0 });
    expect(onClose).toHaveBeenCalled();
  });

  it("selects time when hour then minute are chosen", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();

    render(
      <EventTimeClockModal
        visible
        value={{ hours: 22, minutes: 0 }}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByTestId("event-time-clock-hour-9"));
    expect(screen.getByTestId("event-time-clock-min-15")).toBeTruthy();

    fireEvent.press(screen.getByTestId("event-time-clock-min-15"));

    expect(onSelect).toHaveBeenCalledWith({ hours: 21, minutes: 15 });
    expect(onClose).toHaveBeenCalled();
  });

  it("returns to hour phase from back control", () => {
    const onClose = jest.fn();
    const onSelect = jest.fn();

    render(
      <EventTimeClockModal
        visible
        value={{ hours: 10, minutes: 0 }}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByTestId("event-time-clock-hour-4"));
    fireEvent.press(screen.getByTestId("event-time-clock-back-hour"));
    expect(screen.getByTestId("event-time-clock-am")).toBeTruthy();
  });
});
