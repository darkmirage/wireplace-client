import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import type { Theme } from 'themes';

type Props = React.ComponentPropsWithoutRef<'input'> & {
  focused?: boolean;
  onValueChange?: (value: string) => void;
};

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ focused, className, onValueChange, ...rest }, ref) => {
    const classes = useStyles({ theme: useTheme() });
    const cls = classNames(className, classes.input);
    const handleChange = onValueChange
      ? (event: React.ChangeEvent<HTMLInputElement>) =>
          onValueChange(event.target.value)
      : undefined;

    ref = ref || React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      const r = ref as React.MutableRefObject<HTMLInputElement>;
      if (focused) {
        r.current?.focus();
      } else {
        r.current?.blur();
      }
    }, [focused, ref]);

    return (
      <input {...rest} ref={ref} onChange={handleChange} className={cls} />
    );
  }
);

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
