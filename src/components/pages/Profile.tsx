import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import {
  Centered,
  Panel,
  Input,
  Message,
  Notification,
  Button,
} from 'components/ui';
import Contact from 'components/Contact';
import { Theme } from 'themes';
import firebase from 'firebaseApp';
import { PageProps } from 'components/auth/PageProps';

const Login = (props: PageProps) => {
  const classes = useStyles({ theme: useTheme() });
  const [username, setUsername] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const updateUser = firebase.functions().httpsCallable('updateUser');
      await updateUser({ username });
      Notification.success({
        title: 'Username changed',
        description: `Your username was successfully changed to ${username}`,
      });
      props.history.push(props.location.state?.from || '/');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const errorMessage = error ? (
    <Message type="error" description={error} />
  ) : null;

  return (
    <Centered className={classes.login}>
      <Panel className={classes.panel}>
        <div className={classes.row}>
          <h4>Choose your name</h4>
          <p>
            This name will be associated with your account and visible to all
            users. There is a maximum length of 16 characters.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={classes.row}>
            <Input
              value={username}
              onValueChange={setUsername}
              placeholder="Your username"
              size="lg"
              disabled={loading}
              required
            />
          </div>
          <div className={classes.row}>
            <Button type="submit" color="green" size="lg" loading={loading}>
              Save
            </Button>
          </div>
        </form>
        {errorMessage}
        <Contact />
      </Panel>
    </Centered>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  login: {
    background: theme.color.backgroundLight,
  },
  loginButton: {
    marginRight: theme.spacing.normal,
  },
  panel: {
    color: theme.color.textDark,
    width: 300,
  },
  row: {
    marginBottom: theme.spacing.wide,
  },
}));

export default Login;
