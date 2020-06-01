import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import type { Theme } from 'themes';

type Props = React.ComponentPropsWithoutRef<'div'> & {
  label: React.ReactNode;
};

const Button = ({ className, label, ...rest }: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const cls = classNames(className, classes.button);

  return (
    <div {...rest} className={cls}>
      {label}
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  button: {
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 0,
    borderRadius: theme.spacing.narrow,
    boxSizing: 'border-box',
    color: '#ddd',
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
    outline: 0,
    padding: theme.spacing.normal,
    pointerEvents: 'all',
    transition: '200ms',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.6)',
    },
    '&[type="submit"]': {
      cursor: 'pointer',
    },
  },
}));

export default Button;
