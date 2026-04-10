import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AppNavBar, AuthNavBar } from '@/components/layout/TheRunNavBar';
import { clearAccessToken } from '@/lib/auth/tokenStorage';

jest.mock('@/lib/auth/tokenStorage', () => ({
  clearAccessToken: jest.fn(),
}));

jest.mock('expo-router', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockClearAccessToken = clearAccessToken as jest.MockedFunction<typeof clearAccessToken>;

describe('TheRunNavBar', () => {
  it('AuthNavBar renders brand and auth navigation labels', () => {
    render(<AuthNavBar />);
    expect(screen.getByText('THE RUN')).toBeTruthy();
    expect(screen.getByText('JOIN')).toBeTruthy();
    expect(screen.getByText('SIGN UP')).toBeTruthy();
    expect(screen.getByText('LOG IN')).toBeTruthy();
  });

  it('AppNavBar renders brand, notifications, and log out', () => {
    render(<AppNavBar />);
    expect(screen.getByText('THE RUN')).toBeTruthy();
    expect(screen.getByLabelText('Notifications')).toBeTruthy();
    expect(screen.getByLabelText('Log out')).toBeTruthy();
  });

  it('AppNavBar log out clears session', async () => {
    mockClearAccessToken.mockResolvedValue(undefined);
    render(<AppNavBar />);
    fireEvent.press(screen.getByTestId('app-nav-log-out'));
    await waitFor(() => expect(mockClearAccessToken).toHaveBeenCalledTimes(1));
  });
});
