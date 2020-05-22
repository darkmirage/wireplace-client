import React from 'react';
import { ThemeProvider } from 'react-jss';
import { standard } from 'themes';
import type { Theme } from 'themes';

const ThemeContainer = (props: any) => {
  const [theme] = React.useState<Theme>(standard);
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default ThemeContainer;
