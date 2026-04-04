import { render, screen } from '@testing-library/react-native';

import { AppNavBar, AuthNavBar } from '@/components/layout/TheRunNavBar';

describe('TheRunNavBar', () => {
  it('AuthNavBar renders brand and auth navigation labels', () => {
    render(<AuthNavBar />);
    expect(screen.getByText('THE RUN')).toBeTruthy();
    expect(screen.getByText('JOIN')).toBeTruthy();
    expect(screen.getByText('SIGN UP')).toBeTruthy();
    expect(screen.getByText('LOG IN')).toBeTruthy();
  });

  it('AppNavBar renders brand and notifications control', () => {
    render(<AppNavBar />);
    expect(screen.getByText('THE RUN')).toBeTruthy();
    expect(screen.getByLabelText('Notifications')).toBeTruthy();
  });
});
