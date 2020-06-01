import React from 'react';

const PreventPropagation = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const prevent = (
    event:
      | React.MouseEvent<any>
      | React.TouchEvent<any>
      | React.KeyboardEvent<any>
  ) => {
    event.stopPropagation();
  };
  return (
    <div
      onKeyPress={prevent}
      onMouseUp={prevent}
      onMouseDown={prevent}
      {...props}
    />
  );
};

export default PreventPropagation;
