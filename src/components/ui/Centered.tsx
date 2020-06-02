import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import { Theme } from 'themes';

type Props = React.ComponentPropsWithoutRef<'div'>;

const Centered = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  return (
    <div className={classNames(classes.centered, props.className)}>
      {props.children}
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  centered: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
}));

export default Centered;
