import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import Main from 'components/pages/Main';
import Welcome from 'components/pages/Welcome';
import { Theme } from 'themes';

const DEFAULT_USERNAME = null; //Date.now().toString();

const App = () => {
  const classes = useStyles({ theme: useTheme() });
  const [username, setUsername] = React.useState<string | null>(
    DEFAULT_USERNAME
  );

  return (
    <div className={classes.app}>
      {username === null ? (
        <Welcome onEnterUsername={setUsername} />
      ) : (
        <Main username={username} />
      )}
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  app: {
    fontFamily: theme.fontFamily,
    height: '100%',
  },
}));

export default App;
