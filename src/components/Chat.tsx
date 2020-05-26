import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import type { WirePlaceChatClient, ChatLine } from 'wireplace/WirePlaceClient';
import type { Theme } from 'themes';

type Props = {
  client: WirePlaceChatClient;
};

const Chat = (props: Props) => {
  const { client } = props;
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<{
    m: Record<string, ChatLine>;
  }>({ m: {} });
  const classes = useStyles({ theme: useTheme() });

  React.useEffect(() => {
    client.onMessage((line) => {
      setMessages((messages_) => {
        const { m } = messages_;
        if (line.lineId in m) {
          return messages_;
        }
        m[line.lineId] = line;
        return { m };
      });
    });
  }, [client]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    client.sendMessage(message);
    setMessage('');
  };

  let prevName = '';
  const messageElements = Object.keys(messages.m).map((lineId) => {
    const { message, username } = messages.m[lineId];
    const nameField =
      prevName === username ? null : (
        <div className={classes.username}>{username}</div>
      );
    prevName = username;
    return (
      <div className={classes.message} key={lineId}>
        {nameField}
        <div className={classes.messageText}>{message}</div>
      </div>
    );
  });

  return (
    <div className={classes.root}>
      <div className={classes.messages}>{messageElements}</div>
      <div className={classes.footer}>
        <form onSubmit={handleSubmit}>
          <input
            className={classes.input}
            value={message}
            placeholder="Type something"
            onChange={(evt) => setMessage(evt.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: 300,
    maxHeight: 500,
  },
  footer: {
    marginTop: theme.spacing.normal,
  },
  messages: {
    overflowY: 'scroll',
  },
  message: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing.narrow,
    overflowWrap: 'break-word',
  },
  messageText: {
    background: '#ffffff',
    borderRadius: theme.spacing.narrow,
    padding: theme.spacing.narrow,
  },
  input: {
    padding: theme.spacing.narrow,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.narrow,
    marginTop: theme.spacing.normal,
  },
}));

export default Chat;
