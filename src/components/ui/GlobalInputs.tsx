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
    case '`': {
      getGlobalEmitter().emit(Events.SET_CAMERA_TRACKING_MODE);
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

function handleMouseLeave() {
  getGlobalEmitter().emit(Events.MOUSE_LEAVE);
}

function handleWindowResize() {
  getGlobalEmitter().emit(Events.WINDOW_RESIZE);
}

window.addEventListener('resize', handleWindowResize);

const GlobalInputs = (props: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  function getCoordinates(
    event: React.MouseEvent<any> | React.Touch
  ): { x: number; y: number } | null {
    const div = ref.current;
    if (!div) {
      return null;
    }
    const x = (event.clientX / div.clientWidth) * 2 - 1;
    const y = -(event.clientY / div.clientHeight) * 2 + 1;
    return { x, y };
  }

  function handleMouseMove(event: React.MouseEvent<any>) {
    const coords = getCoordinates(event);
    if (!coords) {
      return;
    }
    getGlobalEmitter().emit(Events.MOUSE_MOVE, coords);
  }

  const prevXY = { x: 0, y: 0 };

  function handleMouseDown(event: React.MouseEvent<any>) {
    if (event.button !== 0) {
      return;
    }
    prevXY.x = event.clientX;
    prevXY.y = event.clientY;
  }

  function handleMouseUp(event: React.MouseEvent<any>) {
    if (event.button !== 0) {
      return;
    }

    const distance = Math.sqrt(
      (event.clientX - prevXY.x) ** 2 + (event.clientY - prevXY.y) ** 2
    );
    const coords = getCoordinates(event);
    if (!coords) {
      return;
    }
    if (distance < 5) {
      getGlobalEmitter().emit(Events.MOUSE_UP, coords);
    }
  }

  function handleTouchStart(event: React.TouchEvent<any>) {
    if (event.touches.length !== 1) {
      return;
    }
    const touch = event.changedTouches[0];
    prevXY.x = touch.clientX;
    prevXY.y = touch.clientY;
  }

  function handleTouchEnd(event: React.TouchEvent<any>) {
    if (event.touches.length !== 0) {
      return;
    }
    const touch = event.changedTouches[0];
    const distance = Math.sqrt(
      (touch.clientX - prevXY.x) ** 2 + (touch.clientY - prevXY.y) ** 2
    );
    const coords = getCoordinates(touch);
    if (!coords) {
      return;
    }
    if (distance < 5) {
      getGlobalEmitter().emit(Events.MOUSE_UP, coords);
    }
  }

  return (
    <EventArea
      ref={ref}
      onKeyPress={handleGlobalKeyPress}
      onKeyDown={handleGlobalKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {props.children}
    </EventArea>
  );
};

export default GlobalInputs;
