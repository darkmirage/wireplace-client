import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { Redirect } from 'react-router-dom';

import { RouteComponentProps } from 'react-router-dom';
import { Centered, Message, Spinner } from 'components/ui';
import { Theme } from 'themes';
import firebase from 'firebaseApp';

type Props = RouteComponentProps;

const Logout = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const [loggedOut, setLoggedOut] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        await firebase.auth().signOut();
        setLoggedOut(true);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  const errorMessage = error ? (
    <Message showIcon type="error" description={error} />
  ) : null;

  const content = loggedOut ? <Redirect to="/" /> : <Spinner />;

  return (
    <Centered className={classes.login}>
      {errorMessage ? errorMessage : content}
    </Centered>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  login: {
    background: theme.color.backgroundLight,
  },
  panel: {
    background: theme.color.panel,
    width: 300,
  },
  row: {
    marginBottom: theme.spacing.wide,
  },
}));

export default Logout;
