import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('should render with label', () => {
    const { getByText } = render(<Input label="Email" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('should show error message', () => {
    const { getByText } = render(<Input label="Email" error="Email is required" />);
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('should show hint text', () => {
    const { getByText } = render(<Input label="Email" hint="Enter valid email" />);
    expect(getByText('Enter valid email')).toBeTruthy();
  });

  it('should not show hint when error is present', () => {
    const { queryByText } = render(
      <Input label="Email" error="Error" hint="Hint" />
    );
    expect(queryByText('Error')).toBeTruthy();
    expect(queryByText('Hint')).toBeNull();
  });

  it('should fire onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = render(
      <Input label="Name" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByLabelText('Name'), 'John');
    expect(onChangeText).toHaveBeenCalledWith('John');
  });
});
