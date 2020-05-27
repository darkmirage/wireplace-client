import React from 'react';

import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';
import EventArea from './EventArea';

type Props = {
  children: React.ReactNode;
};

function handleGlobalKeyPress(event: React.KeyboardEvent<any>) {
  switch (event.key) {
    case 'Enter': {
      getGlobalEmitter().emit(Events.FOCUS_CHAT, true);
      break;
    }
  }
}

function handleGlobalKeyDown(event: React.KeyboardEvent<any>) {
  switch (event.key) {
    case 'Escape': {
      // Note: browser never fires KeyPress event for Escape key
      getGlobalEmitter().emit(Events.FOCUS_CHAT, false);
      break;
    }
  }
}

const GlobalHotKeys = (props: Props) => {
  return (
    <EventArea
      onKeyPress={handleGlobalKeyPress}
      onKeyDown={handleGlobalKeyDown}
    >
      {props.children}
    </EventArea>
  );
};

export default GlobalHotKeys;
