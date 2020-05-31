import React from 'react';
import './Spinner.css';

const Spinner = () => {
  return (
    <svg width="64" height="64" viewBox="0 0 100 100">
      <polyline
        className="line-cornered stroke-still"
        points="0,0 100,0 100,100"
        strokeWidth={20}
        fill="none"
      ></polyline>
      <polyline
        className="line-cornered stroke-still"
        points="0,0 0,100 100,100"
        strokeWidth={20}
        fill="none"
      ></polyline>
      <polyline
        className="line-cornered stroke-animation"
        points="0,0 100,0 100,100"
        strokeWidth={20}
        fill="none"
      ></polyline>
      <polyline
        className="line-cornered stroke-animation"
        points="0,0 0,100 100,100"
        strokeWidth={20}
        fill="none"
      ></polyline>
    </svg>
  );
};

export default Spinner;
