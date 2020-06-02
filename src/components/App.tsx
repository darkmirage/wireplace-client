import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import PrivateRoute from 'components/auth/PrivateRoute';
import AuthenticatedContainer from 'components/auth/AuthenticatedContainer';
import Login from 'components/pages/Login';
import Logout from 'components/pages/Logout';
import Main from 'components/pages/Main';
import Home from 'components/pages/Home';
import { Theme } from 'themes';

const App = () => {
  const classes = useStyles({ theme: useTheme() });

  return (
    <BrowserRouter>
      <div className={classes.app}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/logout" component={Logout} />
          <PrivateRoute
            path="/:roomId/:userId"
            render={(props) => (
              <AuthenticatedContainer>
                {({ uid }) => (
                  <Main
                    roomId={props.match.params['roomId']}
                    username={props.match.params['userId']}
                  />
                )}
              </AuthenticatedContainer>
            )}
          />
          <PrivateRoute
            path="/:roomId"
            render={(props) => (
              <AuthenticatedContainer>
                {({ uid }) => (
                  <Main roomId={props.match.params['roomId']} username={uid} />
                )}
              </AuthenticatedContainer>
            )}
          />
        </Switch>
      </div>
    </BrowserRouter>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  app: {
    fontFamily: theme.fontFamily,
    height: '100%',
  },
}));

export default App;
