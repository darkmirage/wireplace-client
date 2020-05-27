import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import { WirePlaceChatClient, ChatLine } from 'wireplace/WirePlaceClient';
import hexToRGB from 'utils/hexToRGB';
import Input from 'components/ui/Input';
import { Theme } from 'themes';

type Props = {
  client: WirePlaceChatClient;
  username: string;
};

const Chat = (props: Props) => {
  const { client } = props;
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<{
    m: Record<string, ChatLine>;
  }>({ m: {} });
  const ref = React.useRef<HTMLDivElement | null>(null);
  const classes = useStyles({ theme: useTheme() });

  const lineIds = Object.keys(messages.m);
  const lastId = lineIds[lineIds.length - 1];
  const lastLine = messages.m[lastId];

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

  React.useEffect(() => {
    if (ref.current && lastLine && lastLine.username === props.username) {
      ref.current.scrollTo({
        top: ref.current?.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [props.username, lastLine]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message) {
      client.sendMessage(message);
    }
    setMessage('');
  };

  let prevName = '';
  const messageElements = Object.keys(messages.m).map((lineId) => {
    const { color, message, username } = messages.m[lineId];

    const nameField =
      prevName === username ? null : (
        <div className={classes.username} style={{ color: hexToRGB(color) }}>
          {username}
        </div>
      );
    prevName = username;

    const className = classNames(classes.message, {
      [classes.currentUser]: username === props.username,
    });

    return (
      <div className={className} key={lineId}>
        {nameField}
        <div className={classes.messageText}>{message}</div>
      </div>
    );
  });

  const messageArea =
    messageElements.length > 0 ? (
      <div className={classes.messages} ref={ref}>
        {messageElements}
      </div>
    ) : null;

  return (
    <div className={classes.root}>
      {messageArea}
      <div className={classes.footer}>
        <form onSubmit={handleSubmit}>
          <Input
            className={classes.input}
            value={message}
            placeholder="Type something"
            onChange={setMessage}
          />
        </form>
      </div>
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
    position: 'relative',
    width: 300,
  },
  footer: {
    marginRight: theme.spacing.normal,
    padding: theme.spacing.normal,
  },
  messages: {
    maxHeight: 500,
    overflowX: 'hidden',
    overflowY: 'scroll',
    paddingLeft: theme.spacing.normal,
    paddingRight: theme.spacing.normal,
    pointerEvents: 'all',
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: theme.spacing.narrow,
      width: theme.spacing.normal,
    },
    '&::-webkit-scrollbar': {
      background: 'rgba(0, 0, 0, 0)',
      width: theme.spacing.normal,
    },
  },
  message: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing.narrow,
    overflowWrap: 'break-word',
    wordBreak: 'break-all',
  },
  messageText: {
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.spacing.narrow,
    color: '#ddd',
    paddingBottom: theme.spacing.narrow,
    paddingLeft: theme.spacing.normal,
    paddingRight: theme.spacing.normal,
    paddingTop: theme.spacing.narrow,
  },
  input: {
    pointerEvents: 'all',
    width: '100%',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.narrow,
    marginTop: theme.spacing.normal,
  },
  currentUser: {
    alignItems: 'flex-end',
  },
}));

export default Chat;
