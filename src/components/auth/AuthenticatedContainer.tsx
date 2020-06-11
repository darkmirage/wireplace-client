import React from 'react';
import { Redirect } from 'react-router-dom';

import firebase from 'firebaseApp';
import { Loader } from 'components/ui';

type Props = {
  loggedOut?: React.ReactNode;
  spinner?: React.ReactNode;
  children: (user: firebase.User) => React.ReactNode;
};

const AuthenticatedContainer = ({ loggedOut, children, spinner }: Props) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentUser, setCurrentUser] = React.useState<firebase.User | null>(
    null
  );

  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);

      if (user) {
        const { displayName, email, uid } = user;
        firebase.analytics().setUserProperties({ displayName, email, uid });
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return spinner ? <>{spinner}</> : <Loader inverse />;
  }

  if (!currentUser) {
    return <>{loggedOut}</>;
  }

  if (!currentUser.emailVerified) {
    return <Redirect to="/unverified" />;
  }

  return <>{children(currentUser)}</>;
};

export default AuthenticatedContainer;
