import { render, screen } from '@testing-library/react-native';
import NotFoundScreen from '../+not-found';

jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => children,
  Stack: { Screen: ({ options }: { options?: { title?: string } }) => null },
}));

describe('NotFoundScreen', () => {
  it('renders the not-found message', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it('renders the go to home link', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText('Go to home screen')).toBeTruthy();
  });
});
