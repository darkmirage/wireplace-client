import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';
import { Input as RSInput, InputProps } from 'rsuite';

import type { Theme } from 'themes';

type Props = InputProps & {
  focused?: boolean;
  onValueChange?: (value: string) => void;
};

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ focused, className, onValueChange, ...rest }, ref) => {
    const classes = useStyles({ theme: useTheme() });
    const cls = classNames(className, classes.input);

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
      <RSInput
        {...rest}
        inputRef={ref}
        onChange={onValueChange}
        className={cls}
      />
    );
  }
);

const useStyles = createUseStyles<Theme>((theme) => ({
  input: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    '&:hover, &:focus': {
      // background: 'rgba(0, 0, 0, 0.6)',
      borderColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
}));

export default Input;
