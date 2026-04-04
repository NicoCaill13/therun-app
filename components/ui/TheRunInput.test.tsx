/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { TheRunInput } from '@/components/ui/TheRunInput';

describe('TheRunInput', () => {
  it('renders label and forwards text changes', () => {
    const onChangeText = jest.fn();
    render(
      <TheRunInput label="Email" value="" onChangeText={onChangeText} testID="inp" />,
    );
    expect(screen.getByText('EMAIL')).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('inp'), 'x@y.z');
    expect(onChangeText).toHaveBeenCalledWith('x@y.z');
  });

  it('shows error message when provided', () => {
    render(
      <TheRunInput
        label="Email"
        value=""
        onChangeText={jest.fn()}
        errorMessage="Too short"
        testID="inp"
      />,
    );
    expect(screen.getByText('Too short')).toBeTruthy();
  });

  it('updates label emphasis on focus and blur', () => {
    render(<TheRunInput label="Email" value="" onChangeText={jest.fn()} testID="inp" />);
    const input = screen.getByTestId('inp');
    fireEvent(input, 'focus');
    expect(screen.getByText('EMAIL').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#ff5722' })]),
    );
    fireEvent(input, 'blur');
    expect(screen.getByText('EMAIL').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#adaaaa' })]),
    );
  });
});
