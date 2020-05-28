import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';

import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
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
  const [focus, setFocus] = React.useState(false);
  const messagesRef = React.useRef<HTMLDivElement>(null);
  const classes = useStyles({ theme: useTheme() });

  const lineIds = Object.keys(messages.m);
  const lastId = lineIds[lineIds.length - 1];
  const lastLine = messages.m[lastId];

  React.useEffect(() => {
    getGlobalEmitter().on(Events.FOCUS_CHAT, setFocus);
    return () => {
      getGlobalEmitter().off(Events.FOCUS_CHAT, setFocus);
    };
  }, [setFocus]);

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
    if (messagesRef.current && lastLine) {
      messagesRef.current.scrollTo({
        top: messagesRef.current?.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [props.username, lastLine]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message) {
      getGlobalEmitter().emit(Events.FOCUS_CHAT, false);
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
      <div className={classes.messages} ref={messagesRef}>
        {messageElements}
      </div>
    ) : null;

  return (
    <div className={classes.root}>
      {messageArea}
      <div className={classes.footer}>
        <form onSubmit={handleSubmit}>
          <Input
            focused={focus}
            className={focus ? classes.inputFocused : classes.input}
            onBlur={() => getGlobalEmitter().emit(Events.FOCUS_CHAT, false)}
            value={message}
            placeholder={focus ? 'Type something' : 'Press enter to chat'}
            onValueChange={setMessage}
            tabIndex={2}
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
    overflowWrap: 'anywhere',
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
    background: 'rgba(0, 0, 0, 0.25)',
    pointerEvents: 'all',
    width: '100%',
  },
  inputFocused: {
    background: 'rgba(0, 0, 0, 0.5)',
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
