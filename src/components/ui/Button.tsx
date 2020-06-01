import React from 'react';
import classNames from 'classnames';
import { Button as RSButton, ButtonProps } from 'rsuite';
import { createUseStyles } from 'react-jss';
import 'rsuite/dist/styles/rsuite-dark.css';

type Props = ButtonProps & {
  label: React.ReactNode;
};

const Button = ({ className, label, ...rest }: Props) => {
  const classes = useStyles();
  className = classNames(className, classes.button);
  return (
    <RSButton className={className} {...rest} appearance="default">
      {label}
    </RSButton>
  );
};

const useStyles = createUseStyles(() => ({
  button: {
    pointerEvents: 'all',
  },
}));

export default Button;
