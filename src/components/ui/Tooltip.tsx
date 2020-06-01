import React from 'react';
import { Popover, Whisper, WhisperProps } from 'rsuite';

type Props = WhisperProps & {
  placement?: string;
  trigger?: string;
  content?: React.ReactNode;
};

const Tooltip = ({
  title,
  content,
  trigger = 'hover',
  placement = 'bottom',
  children,
  ...rest
}: Props) => {
  const speaker = (
    <Popover title={title} {...rest}>
      {content}
    </Popover>
  );

  return (
    <Whisper trigger={trigger} placement={placement} speaker={speaker}>
      {children}
    </Whisper>
  );
};

export default Tooltip;
