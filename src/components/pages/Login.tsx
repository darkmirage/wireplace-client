import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Centered, Panel, Icon, Input, Message, Button } from 'components/ui';
import { Theme } from 'themes';
import firebase from 'firebaseApp';
import { PageProps } from 'components/auth/PageProps';

const Login = (props: PageProps) => {
  const classes = useStyles({ theme: useTheme() });
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { from } = props.location.state || { from: '/ ' };

  const handleSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      setLoading(false);
      props.history.push(from, { from: '/login' });
    } catch (e) {
      if (
        e.code === 'auth/user-not-found' ||
        e.code === 'auth/wrong-password'
      ) {
        setError('The password is invalid or the user does not exist.');
      } else {
        setError(e.message);
      }
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      props.history.push(from, { from: '/login' });
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const errorMessage = error ? (
    <Message showIcon type="error" description={error} />
  ) : null;

  return (
    <Centered className={classes.login}>
      <Panel className={classes.panel}>
        <div className={classes.row}>
          <h4>Wireplace Login</h4>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={classes.row}>
            <Input
              value={email}
              onValueChange={setEmail}
              type="email"
              placeholder="hello@example.com"
              size="lg"
              disabled={loading}
              required
            />
          </div>
          <div className={classes.row}>
            <Input
              value={password}
              onValueChange={setPassword}
              type="password"
              placeholder="password"
              size="lg"
              disabled={loading}
              required
            />
          </div>
          <div className={classes.row}>
            <Button
              className={classes.loginButton}
              color="green"
              type="submit"
              size="lg"
              loading={loading}
            >
              Log in
            </Button>
            <Button
              appearance="subtle"
              type="submit"
              size="lg"
              loading={loading}
              onClick={() => props.history.push('/signup')}
            >
              Sign up
            </Button>
          </div>
          <div className={classes.row}>
            <Button
              size="md"
              color="red"
              loading={loading}
              icon={<Icon icon="google" />}
              onClick={handleGoogle}
            >
              Log in with Google
            </Button>
          </div>
          {errorMessage}
        </form>
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
