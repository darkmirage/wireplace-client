import React from 'react';

import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';

type Props = React.ComponentPropsWithoutRef<'div'> & {
  // Maintain event focus on this if chat is not focused
  maintainFocus?: boolean;
};

const EventArea = ({ maintainFocus = true, ...rest }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Get focus on initial render
    if (maintainFocus) {
      ref.current?.focus();
    }
  }, [maintainFocus]);

  React.useEffect(() => {
    if (!maintainFocus) {
      return;
    }
    getGlobalEmitter().on(Events.FOCUS_CHAT, (chatFocused) => {
      if (!chatFocused) {
        ref.current?.focus();
      }
    });
  }, [maintainFocus]);

  return <div ref={ref} {...rest} />;
};

export default EventArea;
