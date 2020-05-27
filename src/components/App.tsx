import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Main from 'components/pages/Main';
import Welcome from 'components/pages/Welcome';
import { Theme } from 'themes';

const DEFAULT_USERNAME = null;

const App = () => {
  const classes = useStyles({ theme: useTheme() });
  const [username, setUsername] = React.useState<string | null>(
    DEFAULT_USERNAME
  );

  return (
    <BrowserRouter>
      <div className={classes.app}>
        <Switch>
          <Route
            path="/:username"
            render={(props) => {
              return <Main username={props.match.params['username']} />;
            }}
          />
          <Route
            path="/"
            render={() => {
              return username === null ? (
                <Welcome onEnterUsername={setUsername} />
              ) : (
                <Main username={username} />
              );
            }}
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
