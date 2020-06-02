import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import { Assets } from 'loaders/PreconfiguredAssets';
import { Button, ButtonGroup, Icon, Tooltip } from 'components/ui';
import { Theme } from 'themes';

const AvatarMenu = () => {
  const classes = useStyles({ theme: useTheme() });

  const assets = Assets.map(({ name }, i) => {
    return (
      <Button
        key={name}
        color="blue"
        className={classes.button}
        onClick={() => getGlobalEmitter().emit(Events.SET_ACTIVE_ASSET, i)}
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
        <div>
          <Tooltip
            title="Change avatar"
            content={<div className={classes.popover}>{assets}</div>}
            placement="autoVerticalStart"
            trigger="focus"
            enterable
          >
            <Button icon={<Icon icon="avatar" />} circle></Button>
          </Tooltip>
        </div>
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
    minWidth: 48,
  },
  popover: {
    maxWidth: 224,
  },
}));

export default AvatarMenu;
