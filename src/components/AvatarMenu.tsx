import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Assets } from 'loaders/PreconfiguredAssets';
import { Button, ButtonGroup, Icon, Tooltip } from 'components/ui';
import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import { MenuProps } from 'components/TopToolbar';
import { Theme } from 'themes';

type Props = MenuProps;

const MENU_NAME = 'avatar';

const AvatarMenu = ({ activeMenu, updateDropdown }: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const visible = activeMenu === MENU_NAME;

  const assets = Assets.map(({ name }, i) => {
    return (
      <Button
        key={i}
        className={classes.button}
        onClick={() => {
          getGlobalEmitter().emit(Events.SET_ACTIVE_ASSET, i);
          updateDropdown(MENU_NAME, null);
        }}
      >
        {name}
      </Button>
    );
  });

  return (
    <ButtonGroup className={classes.root}>
      <Tooltip
        content="Change avatar"
        placement="autoVerticalStart"
        trigger="hover"
      >
        <Button
          active={visible}
          icon={<Icon icon="avatar" />}
          circle
          onClick={() => {
            const newVisible = !visible;
            updateDropdown(MENU_NAME, newVisible ? assets : null);
          }}
        />
      </Tooltip>
    </ButtonGroup>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    marginRight: theme.spacing.normal,
  },
  button: {
    margin: theme.spacing.narrow,
    width: 48,
  },
}));

export default AvatarMenu;
