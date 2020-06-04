import React from 'react';
import { useHistory } from 'react-router-dom';
import { createUseStyles, useTheme } from 'react-jss';

import { DEFAULT_ROOM_ID } from 'constants/ServerConfigs';
import { Button, Loader } from 'components/ui';
import { Theme } from 'themes';
import AuthenticatedContainer from './AuthenticatedContainer';

const UserControls = () => {
  const classes = useStyles({ theme: useTheme() });
  const history = useHistory();

  const loggedOut = (
    <div className={classes.user}>
      <Button
        componentClass="a"
        className={classes.userButton}
        onClick={() => history.push('/signup', { from: '/' })}
      >
        Sign up
      </Button>
      <Button
        componentClass="a"
        className={classes.userButton}
        style={{ marginRight: 8 }}
        onClick={() => history.push('/login', { from: '/' + DEFAULT_ROOM_ID })}
        appearance="subtle"
      >
        Log in
      </Button>
    </div>
  );

  const spinner = (
    <div className={classes.user}>
      <Loader size="md" inverse />
    </div>
  );

  const loggedIn = () => (
    <div className={classes.user}>
      <Button
        componentClass="a"
        className={classes.userButton}
        onClick={() => history.push('/' + DEFAULT_ROOM_ID, { from: '/' })}
      >
        Enter #{DEFAULT_ROOM_ID}
      </Button>
      <Button
        componentClass="a"
        appearance="subtle"
        className={classes.userButton}
        onClick={() => history.push('/logout', { from: '/' })}
      >
        Log out
      </Button>
    </div>
  );

  return (
    <AuthenticatedContainer loggedOut={loggedOut} spinner={spinner}>
      {loggedIn}
    </AuthenticatedContainer>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  home: {
    background: theme.color.backgroundLight,
  },
  user: {
    color: theme.color.textDark,
    background: theme.color.backgroundLight,
    minHeight: 36,
  },
  userButton: {
    marginRight: theme.spacing.normal,
  },
}));

export default UserControls;
