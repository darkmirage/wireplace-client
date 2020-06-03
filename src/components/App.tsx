import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Theme } from 'themes';
import Home from 'components/pages/Home';
import Login from 'components/pages/Login';
import Logout from 'components/pages/Logout';
import Room from 'components/pages/Room';
import PrivateRoute from 'components/auth/PrivateRoute';
import SignUp from 'components/pages/SignUp';

const App = () => {
  const classes = useStyles({ theme: useTheme() });

  return (
    <BrowserRouter>
      <div className={classes.app}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/unverified" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/logout" component={Logout} />
          <Route exact path="/signup" component={SignUp} />
          <PrivateRoute path="/:roomId/:userId" component={Room} />
          <PrivateRoute path="/:roomId" component={Room} />
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
