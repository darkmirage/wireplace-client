import React from 'react';
import { useHistory } from 'react-router-dom';

import firebase from 'firebaseApp';

const logCurrentPage = () => {
  const screenName = window.location.pathname;
  firebase.analytics().setCurrentScreen(window.location.pathname);
  firebase.analytics().logEvent('screen_view', {
    screen_name: screenName,
    app_name: 'Wireplace',
  });
};

const AnalyticsComponent = () => {
  const history = useHistory();
  React.useEffect(() => {
    logCurrentPage();
    history.listen(() => {
      logCurrentPage();
    });
  }, [history]);
  return null;
};

export default AnalyticsComponent;
