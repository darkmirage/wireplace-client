import React from 'react';
import { Redirect } from 'react-router-dom';

import { Message } from 'components/ui';
import firebase from 'firebaseApp';
import { PageProps } from './PageProps';

const Unverified = (props: PageProps) => {
  const [verified, setVerified] = React.useState<boolean>(false);

  React.useEffect(() => {
    const user = firebase.auth().currentUser;
    if (user?.emailVerified) {
      setVerified(true);
      return;
    }

    const unsub = firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser?.emailVerified) {
        setVerified(true);
      }
    });
    return unsub;
  }, []);

  if (verified) {
    return <Redirect to="/" />;
  }

  return (
    <Message
      type="info"
      showIcon
      description={
        <>
          Your email has not been verified. Please checked your inbox for the
          verificiation link, click on it, and refresh this page.
        </>
      }
    />
  );
};

export default Unverified;
