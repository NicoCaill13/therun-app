import { render, screen } from '@testing-library/react-native';

import { EventCard } from '@/components/ui/EventCard';

const baseProps = {
  title: 'City Limits Sprint',
  date: 'Sat, Oct 26',
  time: '18:30',
  location: 'Industrial District',
  organizer: 'Marcus Vane',
  eventKind: 'social_run' as const,
};

describe('EventCard', () => {
  it('renders feed with frame, narrow-layout shadow host, and no inner photo accent strip', () => {
    render(<EventCard {...baseProps} status="GOING" />);

    expect(screen.getByTestId('event-card-shadow-host')).toBeTruthy();
    expect(screen.getByTestId('event-card')).toBeTruthy();
    expect(screen.queryByTestId('event-card-accent')).toBeNull();
    expect(screen.getByText('SOCIAL RUN')).toBeTruthy();
    expect(screen.getByText('City Limits Sprint')).toBeTruthy();
    expect(screen.getByText('SAT, OCT 26 • 18:30')).toBeTruthy();
    expect(screen.getByText('Industrial District')).toBeTruthy();
    expect(screen.getByText('ORGANIZER')).toBeTruthy();
    expect(screen.getByText('Marcus Vane')).toBeTruthy();
    expect(screen.getByText('GOING')).toBeTruthy();
  });

  it('omits perimeter frame and shadow host when showPerimeterFrame is false', () => {
    render(<EventCard {...baseProps} status="GOING" showPerimeterFrame={false} />);
    expect(screen.queryByTestId('event-card-shadow-host')).toBeNull();
    expect(screen.getByTestId('event-card')).toBeTruthy();
    expect(screen.getByText('City Limits Sprint')).toBeTruthy();
  });

  it('renders PLANNED and NOT GOING status labels', () => {
    const { rerender } = render(<EventCard {...baseProps} status="PLANNED" />);
    expect(screen.getByText('PLANNED')).toBeTruthy();
    rerender(<EventCard {...baseProps} status="NOT GOING" />);
    expect(screen.getByText('NOT GOING')).toBeTruthy();
  });

  it('featured omits shadow host when showPerimeterFrame is false', () => {
    render(
      <EventCard {...baseProps} status="GOING" variant="featured" showPerimeterFrame={false} />,
    );
    expect(screen.queryByTestId('event-card-shadow-host')).toBeNull();
    expect(screen.getByTestId('event-card-accent')).toBeTruthy();
  });

  it('featured variant shows calendar meta and TECHNICAL TRAIL label', () => {
    render(
      <EventCard
        {...baseProps}
        status="PLANNED"
        variant="featured"
        eventKind="technical_trail"
      />,
    );
    expect(screen.getByTestId('event-card-shadow-host')).toBeTruthy();
    expect(screen.getByTestId('event-card')).toBeTruthy();
    expect(screen.getByTestId('event-card-accent')).toBeTruthy();
    expect(screen.getByText('TECHNICAL TRAIL')).toBeTruthy();
    expect(screen.getByText('SAT, OCT 26 · 18:30')).toBeTruthy();
    expect(screen.getByText('City Limits Sprint')).toBeTruthy();
  });

  it('rail variant shows time row, host line, and SOCIAL TRAIL label', () => {
    render(<EventCard {...baseProps} status="GOING" variant="rail" eventKind="social_trail" />);
    expect(screen.getByTestId('event-card-shadow-host')).toBeTruthy();
    expect(screen.getByTestId('event-card')).toBeTruthy();
    expect(screen.getByTestId('event-card-accent')).toBeTruthy();
    expect(screen.getByText('SOCIAL TRAIL')).toBeTruthy();
    expect(screen.getByText('18:30')).toBeTruthy();
    expect(screen.getByText('HOST: ')).toBeTruthy();
    expect(screen.getByText('MARCUS VANE')).toBeTruthy();
  });
});
