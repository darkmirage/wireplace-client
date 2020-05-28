import React from 'react';

const PreventPropagation = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const prevent = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return <div onMouseUp={prevent} {...props} />;
};

export default PreventPropagation;
