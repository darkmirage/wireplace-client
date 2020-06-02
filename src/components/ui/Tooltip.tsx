import React from 'react';
import { Tooltip as RSTooltip, Whisper, WhisperProps } from 'rsuite';

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
  const speaker = <RSTooltip>{content}</RSTooltip>;

  return (
    <Whisper
      trigger={trigger}
      placement={placement}
      speaker={speaker}
      {...rest}
    >
      {children}
    </Whisper>
  );
};

export default Tooltip;
