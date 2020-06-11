import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import { Theme } from 'themes';
import AnalyticsComponent from 'components/AnalyticsComponent';
import Home from 'components/pages/Home';
import Login from 'components/pages/Login';
import Logout from 'components/pages/Logout';
import PrivateRoute from 'components/auth/PrivateRoute';
import Profile from 'components/pages/Profile';
import Room from 'components/pages/Room';
import SignUp from 'components/pages/SignUp';

const App = () => {
  const classes = useStyles({ theme: useTheme() });

  return (
    <BrowserRouter>
      <div className={classes.app}>
        <AnalyticsComponent />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/waitlist" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/logout" component={Logout} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/unverified" component={Home} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <PrivateRoute exact path="/:roomId" component={Room} />
          <Route path="/" render={() => <Redirect to="/" />} />
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
