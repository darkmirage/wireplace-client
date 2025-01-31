import React from 'react';
import ReactDOM from 'react-dom';

import App from 'components/App';
import ThemeContainer from 'components/ThemeContainer';

import * as serviceWorker from './serviceWorker';
import 'rsuite/dist/styles/rsuite-dark.css';

const touchsupport =
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;
if (!touchsupport) {
  // browser doesn't support touch
  document.documentElement.className = 'non-touch';
}

ReactDOM.render(
  <React.Fragment>
    <ThemeContainer>
      <App />
    </ThemeContainer>
  </React.Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
