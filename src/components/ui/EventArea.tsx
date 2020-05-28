import React from 'react';

import { getGlobalEmitter, Events } from 'wireplace/TypedEventsEmitter';

type Props = React.ComponentPropsWithoutRef<'div'> & {
  // Maintain event focus on this if chat is not focused
  maintainFocus?: boolean;
};

const EventArea = React.forwardRef<HTMLDivElement, Props>(
  ({ maintainFocus = true, ...rest }, ref) => {
    ref = ref || React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      // Get focus on initial render
      if (maintainFocus) {
        const r = ref as React.MutableRefObject<HTMLDivElement>;
        r.current?.focus();
      }
    }, [maintainFocus, ref]);

    React.useEffect(() => {
      if (!maintainFocus) {
        return;
      }
      const handleFocus = (chatFocused: boolean) => {
        if (!chatFocused) {
          const r = ref as React.MutableRefObject<HTMLDivElement>;
          r.current?.focus();
        }
      };
      getGlobalEmitter().on(Events.FOCUS_CHAT, handleFocus);
      return () => {
        getGlobalEmitter().off(Events.FOCUS_CHAT, handleFocus);
      };
    }, [maintainFocus, ref]);

    return (
      <div
        style={{ height: '100%', position: 'relative' }}
        ref={ref}
        {...rest}
      />
    );
  }
);

export default EventArea;
