import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import type { Theme } from 'themes';

type Props = {
  value?: string;
  className?: string;
  placeholder?: string;
  type?: string;
  onChange?: (value: string) => void;
};

const Input = ({
  type,
  placeholder,
  className,
  onChange,
  value,
  ...rest
}: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const cls = classNames(className, classes.input);
  const handleChange = onChange
    ? (event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
    : undefined;

  return (
    <input
      {...rest}
      onChange={handleChange}
      className={cls}
      value={value}
      placeholder={placeholder}
      type={type}
    />
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
    outline: 0,
    padding: theme.spacing.normal,
    '&::placeholder': {
      color: '#ffffff',
      opacity: 0.4,
    },
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.6)',
    },
    '&[type="submit"]': {
      cursor: 'pointer',
    },
  },
}));

export default Input;
