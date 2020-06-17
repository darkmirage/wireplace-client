import React from 'react';
import { useHistory } from 'react-router-dom';
import { createUseStyles, useTheme } from 'react-jss';

import { Button, Input, Message } from 'components/ui';
import { Theme } from 'themes';

function uuid(): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

const JoinChannel = () => {
  const classes = useStyles({ theme: useTheme() });
  const history = useHistory();

  const [username, setUsername] = React.useState<string>(
    localStorage.getItem('WIREPLACE_USER') || ''
  );
  const [room, setRoom] = React.useState<string>(
    localStorage.getItem('WIREPLACE_ROOM') || 'main'
  );
  const [error, setError] = React.useState<string>('');

  const handleUsername = (value: string) => {
    localStorage.setItem('WIREPLACE_USER', value);
    localStorage.setItem('WIREPLACE_UUID', uuid());
    setUsername(value);
  };

  const handleRoom = (value: string) => {
    setRoom(value);
    localStorage.setItem('WIREPLACE_ROOM', value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username) {
      setError('Invalid username');
    } else {
      history.push('/' + room);
    }
  };

  const errorMessage = error ? (
    <Message showIcon type="error" description={error} />
  ) : null;

  return (
    <div className={classes.user}>
      <form onSubmit={handleSubmit}>
        <div className={classes.row}>
          Username
          <Input
            value={username}
            className={classes.input}
            onValueChange={handleUsername}
          />
        </div>
        <div className={classes.row}>
          Room
          <Input
            value={room}
            className={classes.input}
            onValueChange={handleRoom}
          />
        </div>

        <div className={classes.row}>
          <Button className={classes.userButton} type="submit">
            Enter #{room}
          </Button>
        </div>
      </form>
      {errorMessage}
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  home: {
    background: theme.color.backgroundLight,
  },
  row: {
    marginBottom: theme.spacing.normal,
  },
  input: {
    maxWidth: 256,
  },
  user: {
    color: theme.color.textDark,
    background: theme.color.backgroundLight,
    minHeight: 36,
  },
  userButton: {
    marginRight: theme.spacing.normal,
    marginTop: theme.spacing.normal,
  },
}));

export default JoinChannel;
