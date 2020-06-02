import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';
import { formatDistanceToNow } from 'date-fns';

import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import { WirePlaceChatClient, ChatLine } from 'wireplace/WirePlaceClient';
import {
  Animation,
  Input,
  Button,
  Icon,
  Tooltip,
  PreventPropagation,
} from 'components/ui';
import hexToRGB from 'utils/hexToRGB';
import { Theme } from 'themes';

type Props = {
  client: WirePlaceChatClient;
  username: string;
};

const TextChat = (props: Props) => {
  const { client } = props;
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<{
    m: Record<string, ChatLine>;
  }>({ m: {} });
  const [focus, setFocus] = React.useState(false);
  const [hideChat, setHideChat] = React.useState(true);

  const messagesRef = React.useRef<HTMLDivElement>(null);
  const classes = useStyles({ theme: useTheme() });

  const lineIds = Object.keys(messages.m);
  const lastId = lineIds[lineIds.length - 1];
  const lastLine = messages.m[lastId];

  React.useEffect(() => {
    setTimeout(() => {
      setHideChat(false);
    }, 2000);
  }, []);

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
      client.sendMessage(message);
    } else {
      getGlobalEmitter().emit(Events.FOCUS_CHAT, false);
    }
    setMessage('');
  };

  let prevName = '';
  const messageElements = Object.keys(messages.m).map((lineId) => {
    const { color, message, username, time } = messages.m[lineId];
    const timestamp = formatDistanceToNow(time);

    const nameField =
      prevName === username ? null : (
        <div className={classes.username} style={{ color: hexToRGB(color) }}>
          {username}
        </div>
      );
    prevName = username;

    const isCurrentUser = username === props.username;
    const className = classNames(classes.message, {
      [classes.currentUser]: isCurrentUser,
    });

    return (
      <div className={className} key={lineId}>
        {nameField}
        <Tooltip
          content={`${timestamp} ago`}
          placement={isCurrentUser ? 'left' : 'right'}
        >
          <Animation.Slide
            in
            transitionAppear
            placement={isCurrentUser ? 'right' : 'left'}
          >
            <PreventPropagation className={classes.messageText}>
              {message}
            </PreventPropagation>
          </Animation.Slide>
        </Tooltip>
      </div>
    );
  });

  const messageArea =
    messageElements.length > 0 ? (
      <Animation.Fade in={!hideChat} transitionAppear>
        <div className={classes.messages} ref={messagesRef}>
          {messageElements}
        </div>
      </Animation.Fade>
    ) : null;

  return (
    <div className={classes.root}>
      {messageArea}
      <PreventPropagation className={classes.footer}>
        <Tooltip
          content={hideChat ? 'Show Chat' : 'Hide Chat'}
          placement="topStart"
        >
          <Button
            icon={<Icon icon="commenting-o" />}
            onClick={() => setHideChat(!hideChat)}
            active={!hideChat}
          />
        </Tooltip>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Input
            focused={focus}
            className={classNames(classes.input, {
              [classes.inputFocused]: focus,
            })}
            onBlur={() => getGlobalEmitter().emit(Events.FOCUS_CHAT, false)}
            onFocus={() => {
              getGlobalEmitter().emit(Events.FOCUS_CHAT, true);
              setHideChat(false);
            }}
            value={message}
            placeholder={focus ? 'Type something' : 'Press enter to chat'}
            onValueChange={setMessage}
            tabIndex={2}
          />
        </form>
      </PreventPropagation>
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none',
  },
  footer: {
    display: 'flex',
    padding: theme.spacing.normal,
    pointerEvents: 'auto',
  },
  messages: {
    maskImage:
      'linear-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 20px, black 100px, black 100%)',
    maxHeight: 500,
    minHeight: 300,
    overflowX: 'hidden',
    overflowY: 'scroll',
    paddingLeft: theme.spacing.normal,
    paddingRight: theme.spacing.normal,
    pointerEvents: 'auto',
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: theme.spacing.narrow,
      pointerEvents: 'auto',
      width: theme.spacing.normal,
    },
    '&::-webkit-scrollbar': {
      background: 'rgba(0, 0, 0, 0)',
      pointerEvents: 'auto',
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
    pointerEvents: 'auto',
    userSelect: 'text',
  },
  form: {
    marginLeft: theme.spacing.narrow,
    width: '100%',
  },
  input: {
    background: 'rgba(0, 0, 0, 0.25)',
    height: '100%',
    width: '100%',
  },
  inputFocused: {
    background: 'rgba(0, 0, 0, 0.5)',
  },
  username: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.narrow,
    marginTop: theme.spacing.normal,
    userSelect: 'none',
  },
  currentUser: {
    alignItems: 'flex-end',
  },
  tooltip: {},
}));

export default TextChat;
