import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { RouteComponentProps } from 'react-router-dom';
import { Centered, Panel, Icon, Input, Message, Button } from 'components/ui';
import { Theme } from 'themes';
import firebase from 'firebaseApp';

type Props = RouteComponentProps<{}, {}, { from: string }>;

const SignUp = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const [email, setEmail] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { from } = props.location.state || { from: '/ ' };

  const handleSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      result.user?.sendEmailVerification();
      props.history.push(from, { from: '/signup' });
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      props.history.push(from, { from: '/signup' });
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
          <h4>Closed Beta Sign Up</h4>
        </div>
        <div className={classes.row}>
          Wireplace is currently in closed beta. Sign up for an account to get
          on the waitlist and we promise to reach out to you as we onboard more
          users. Thank you!{' '}
          <span role="img" aria-label="grin">
            😀
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={classes.row}>
            <Input
              value={name}
              onValueChange={setName}
              placeholder="Your name (not publicly visible)"
              size="lg"
              disabled={loading}
              required
            />
          </div>
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
              placeholder="Your password"
              size="lg"
              disabled={loading}
              required
            />
          </div>
          <div className={classes.row}>
            <Input
              componentClass="textarea"
              value={message}
              onValueChange={setMessage}
              placeholder="What do I want to do on Wireplace?"
              rows={4}
              size="lg"
              disabled={loading}
              required
            />
          </div>
          <div className={classes.row}>
            <Button type="submit" color="green" size="lg" loading={loading}>
              Sign up
            </Button>
          </div>
          <div className={classes.row}>
            <Button
              size="md"
              color="red"
              loading={loading}
              onClick={handleGoogle}
              icon={<Icon icon="google" />}
            >
              Sign up with Google
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
    width: 400,
  },
  row: {
    marginBottom: theme.spacing.wide,
  },
}));

export default SignUp;
