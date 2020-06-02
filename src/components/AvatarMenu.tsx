import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import { Assets } from 'loaders/PreconfiguredAssets';
import { Button, ButtonGroup, Icon, Popover, Tooltip } from 'components/ui';
import { Theme } from 'themes';

const AvatarMenu = () => {
  const classes = useStyles({ theme: useTheme() });
  const [visible, setVisible] = React.useState<boolean>(false);

  const assets = Assets.map(({ name }, i) => {
    let color = 'orange';
    if (name[0] === 'M') {
      color = 'green';
    } else if (name[0] === 'F') {
      color = 'cyan';
    }
    return (
      <div>
        <Button
          key={name}
          className={classes.button}
          onClick={() => {
            getGlobalEmitter().emit(Events.SET_ACTIVE_ASSET, i);
            setVisible(false);
          }}
          circle
          color={color as any}
        >
          {name}
        </Button>
      </div>
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
          onClick={() => setVisible(!visible)}
        />
      </Tooltip>
      <Popover className={classes.popover} visible={visible}>
        <div className={classes.popoverContent}>{assets}</div>
      </Popover>
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
  popover: {
    position: 'absolute',
    marginTop: 44,
  },
  popoverContent: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: 400,
    minWidth: 224,
  },
}));

export default AvatarMenu;
