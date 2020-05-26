import React from 'react';

import type { WirePlaceChatClient, ChatLine } from 'wireplace/WirePlaceClient';

type Props = {
  client: WirePlaceChatClient;
};

const Chat = (props: Props) => {
  const { client } = props;
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<{
    m: Record<string, ChatLine>;
  }>({ m: {} });

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

  const messageElements = Object.keys(messages.m).map((lineId) => {
    const { message, username } = messages.m[lineId];
    return (
      <div key={lineId}>
        <strong>{username}</strong>: {message}
      </div>
    );
  });

  return (
    <div>
      {messageElements}
      <form onSubmit={handleSubmit}>
        <input
          value={message}
          placeholder="Type something"
          onChange={(evt) => setMessage(evt.target.value)}
        />
      </form>
    </div>
  );
};

export default Chat;
