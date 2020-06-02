import React from 'react';
import classNames from 'classnames';
import { Button as RSButton, IconButton, IconButtonProps } from 'rsuite';
import { createUseStyles } from 'react-jss';
import 'rsuite/dist/styles/rsuite-dark.css';

type Props = IconButtonProps;

const Button = ({ icon, circle, className, ...rest }: Props) => {
  const classes = useStyles();
  className = classNames(className, classes.button);

  return icon ? (
    <IconButton icon={icon} className={className} circle={circle} {...rest} />
  ) : (
    <RSButton className={className} {...rest} />
  );
};

const useStyles = createUseStyles({
  button: {},
});

export default Button;
