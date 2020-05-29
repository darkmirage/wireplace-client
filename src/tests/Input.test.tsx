import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';

import { renderWithTheme } from 'tests/testUtils';
import Input from 'components/ui/Input';

describe('<Input>', () => {
  const initialValue = 'testing';

  test('renders', () => {
    const { getByDisplayValue } = renderWithTheme(
      <Input value={initialValue} readOnly />
    );
    const input = getByDisplayValue(initialValue);
    expect(input.tagName).toEqual('INPUT');
    expect(input).toBeInTheDocument();
  });

  test('updates', () => {
    let testValue = null;
    const Tester = () => {
      return (
        <Input
          value={initialValue}
          onValueChange={(value) => {
            testValue = value;
          }}
        />
      );
    };
    const { getByDisplayValue } = renderWithTheme(<Tester />);

    const input = getByDisplayValue(initialValue) as HTMLInputElement;
    expect(input.tagName).toEqual('INPUT');
    expect(input).toBeInTheDocument();

    input.value = 'dog';
    ReactTestUtils.Simulate.change(input);
    expect(testValue).toEqual('dog');
  });
});
