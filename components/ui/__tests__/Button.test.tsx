import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text children', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress handler', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Button onPress={onPress}>Submit</Button>);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when isDisabled is true', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button isDisabled onPress={onPress}>
        Disabled
      </Button>
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should be disabled when isLoading is true', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button isLoading onPress={onPress}>
        Loading
      </Button>
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator', () => {
    const { UNSAFE_queryByType } = render(
      <Button isLoading>Loading</Button>
    );
    // ActivityIndicator should be rendered
    expect(UNSAFE_queryByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });

  it('should set accessibility label from string children', () => {
    const { getByLabelText } = render(<Button>Submit</Button>);
    expect(getByLabelText('Submit')).toBeTruthy();
  });
});
