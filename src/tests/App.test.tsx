import React from 'react';
import { render } from '@testing-library/react';
import App from 'components/App';

test('renders header', () => {
  const { getByText } = render(<App />);
  const headerElement = getByText(/WirePlace/i);
  expect(headerElement).toBeInTheDocument();
});
