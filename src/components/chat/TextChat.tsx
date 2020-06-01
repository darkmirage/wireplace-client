import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import classNames from 'classnames';
import { formatDistanceToNow } from 'date-fns';

import { Events, getGlobalEmitter } from 'wireplace/TypedEventsEmitter';
import { WirePlaceChatClient, ChatLine } from 'wireplace/WirePlaceClient';
import PreventPropagation from 'components/ui/PreventPropagation';
import hexToRGB from 'utils/hexToRGB';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
import Tooltip from 'components/ui/Tooltip';
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
  const [hideChat, setHideChat] = React.useState(false);

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
          <PreventPropagation className={classes.messageText}>
            {message}
          </PreventPropagation>
        </Tooltip>
      </div>
    );
  });

  const messageArea =
    messageElements.length > 0 ? (
      <div
        className={classNames(classes.messages, { hidden: hideChat })}
        ref={messagesRef}
      >
        {messageElements}
      </div>
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
            label={
              hideChat ? (
                <i className="fas fa-comment-alt"></i>
              ) : (
                <i className="far fa-comment-alt"></i>
              )
            }
            onClick={() => setHideChat(!hideChat)}
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
    pointerEvents: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    padding: theme.spacing.normal,
  },
  messages: {
    overflowX: 'hidden',
    overflowY: 'scroll',
    paddingLeft: theme.spacing.normal,
    paddingRight: theme.spacing.normal,
    pointerEvents: 'all',
    transition: '200ms',
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: theme.spacing.narrow,
      width: theme.spacing.normal,
    },
    '&::-webkit-scrollbar': {
      background: 'rgba(0, 0, 0, 0)',
      width: theme.spacing.normal,
    },
    '&.hidden': {
      opacity: 0,
      pointerEvents: 'none',
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
  form: {
    marginLeft: theme.spacing.narrow,
    width: '100%',
  },
  input: {
    background: 'rgba(0, 0, 0, 0.25)',
    pointerEvents: 'all',
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
    pointerEvents: 'none',
  },
  currentUser: {
    alignItems: 'flex-end',
  },
  tooltip: {},
}));

export default TextChat;
