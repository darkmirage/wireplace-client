import React from 'react';
import { render } from '@testing-library/react';
import ThemeContainer from 'components/ThemeContainer';

export const renderWithTheme = (children: React.ReactNode) =>
  render(<ThemeContainer>{children}</ThemeContainer>);
