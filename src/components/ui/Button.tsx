import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import type { Theme } from 'themes';

type Props = React.ComponentPropsWithoutRef<'div'> & {
  label: string;
};

const Button = ({ className, label, ...rest }: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const cls = classNames(className, classes.input);

  return (
    <div {...rest} className={cls}>
      {label}
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  input: {
    transition: '200ms',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 0,
    borderRadius: theme.spacing.narrow,
    boxSizing: 'border-box',
    color: '#ddd',
    cursor: 'pointer',
    display: 'inline-box',
    outline: 0,
    padding: theme.spacing.normal,
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.6)',
    },
    '&[type="submit"]': {
      cursor: 'pointer',
    },
  },
}));

export default Button;
