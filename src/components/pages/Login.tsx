import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { RouteComponentProps } from 'react-router-dom';
import { Centered, Panel, Input, Message, Button } from 'components/ui';
import { Theme } from 'themes';
import firebase from 'firebaseApp';

type Props = RouteComponentProps<{}, {}, { from: string }>;

const Login = (props: Props) => {
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
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);
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
              type="submit"
              appearance="primary"
              size="lg"
              loading={loading}
            >
              Login
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
  panel: {
    color: theme.color.textDark,
    width: 300,
  },
  row: {
    marginBottom: theme.spacing.wide,
  },
}));

export default Login;
