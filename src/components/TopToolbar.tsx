import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import { ButtonToolbar, PreventPropagation } from 'components/ui';
import { Theme } from 'themes';
import firebase from 'firebaseApp';

export type UpdateDropdown = (menu: string, content: React.ReactNode) => void;

export interface MenuProps {
  updateDropdown: UpdateDropdown;
  activeMenu: string;
}

type Props = {
  children: (props: MenuProps) => React.ReactNode;
};

const TopToolbar = ({ children }: Props) => {
  const classes = useStyles({ theme: useTheme() });

  const [menu, setMenu] = React.useState<string>('');
  const [content, setContent] = React.useState<React.ReactNode>(null);

  const callback: UpdateDropdown = (newMenu, newContent) => {
    if (newContent) {
      setContent(newContent);
      setMenu(newMenu);
      firebase.analytics().logEvent('menu_open', { menuName: newMenu });
    } else {
      setContent(null);
      setMenu('');
      firebase.analytics().logEvent('menu_close');
    }
  };

  return (
    <ButtonToolbar className={classes.toolbar}>
      {children({ updateDropdown: callback, activeMenu: menu })}
      <PreventPropagation
        className={classNames(classes.popover, {
          [classes.visible]: !!content,
        })}
      >
        {content}
      </PreventPropagation>
    </ButtonToolbar>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  toolbar: {
    padding: theme.spacing.normal,
    pointerEvents: 'auto',
  },
  popover: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: 36,
    maxWidth: 400,
    minWidth: 224,
    opacity: 0,
    pointerEvents: 'none',
    position: 'absolute',
    transition: '200ms',
    zIndex: theme.zIndices.top,
  },
  visible: {
    opacity: 1.0,
    pointerEvents: 'auto',
  },
}));

export default TopToolbar;
