import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Button, ButtonGroup, Icon, Tooltip } from 'components/ui';
import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import { MenuProps } from 'components/TopToolbar';
import { Theme } from 'themes';
import Emotes from 'constants/Emotes';

type Props = MenuProps;

const MENU_NAME = 'emote';

const EmoteMenu = ({ updateDropdown, activeMenu }: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const visible = activeMenu === MENU_NAME;

  const emotes = Emotes.map(({ displayName, type_, state }) => {
    return (
      <div key={type_}>
        <Button
          className={classes.button}
          onClick={() => {
            updateDropdown(MENU_NAME, null);
            getGlobalEmitter().emit(Events.PERFORM_ACTION, {
              actionType: type_,
              actionState: state,
            });
          }}
        >
          {displayName}
        </Button>
      </div>
    );
  });

  return (
    <ButtonGroup className={classes.root}>
      <Tooltip content="Do emote" placement="autoVerticalStart" trigger="hover">
        <Button
          active={visible}
          icon={<Icon icon="smile-o" />}
          circle
          onClick={() => {
            const newVisible = !visible;
            updateDropdown(MENU_NAME, newVisible ? emotes : null);
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
    minWidth: 48,
  },
}));

export default EmoteMenu;
