import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Button, Centered, Icon, Input, Message, Panel } from 'components/ui';
import { Theme } from 'themes';
import firebase from 'firebaseApp';
import { PageProps } from 'components/auth/PageProps';

const SignUp = (props: PageProps) => {
  const classes = useStyles({ theme: useTheme() });
  const [email, setEmail] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { from } = props.location.state || { from: '/ ' };

  const verifyAndSave = async (user: firebase.User | null) => {
    if (!user) {
      throw new Error('User creation error. Please try again.');
    }

    if (!user.emailVerified) {
      user.sendEmailVerification({ url: 'https://www.wireplace.net/' });
    }

    const fullName = user.displayName || name;
    await firebase.firestore().collection('signups').doc(user.uid).set({
      fullName,
      message,
    });
    props.history.push(from, { from: '/signup' });
  };

  const handleSubmit = async (event: React.FormEvent<any>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      await verifyAndSave(result.user);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(provider);
      await verifyAndSave(result.user);
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
          Wireplace is currently in closed beta. Sign up for an account to
          reserve a username and get on the waitlist. We promise to reach out to
          you as we onboard more users. Thank you!{' '}
          <span role="img" aria-label="grin">
            😀
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={classes.row}>
            <Input
              value={name}
              onValueChange={setName}
              placeholder="Your name (will not be shown to other users)"
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
              placeholder="What do I want to do on Wireplace? (optional)"
              rows={4}
              size="lg"
              disabled={loading}
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
              color="blue"
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
