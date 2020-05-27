import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import Input from 'components/ui/Input';
import { Theme } from 'themes';
import logger from 'utils/logger';

type Props = {
  onEnterUsername: (username: string) => void;
};

const Welcome = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const [text, setText] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (text) {
      props.onEnterUsername(text);
      logger.log('Username:', text);
    }
  };

  return (
    <div className={classes.root}>
      <h1>WirePlace</h1>
      <div>Enter a username to chat</div>
      <div>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Input
            focused
            onValueChange={setText}
            placeholder="Your username"
            tabIndex={1}
          />
          <Input className={classes.submit} type="submit" />
        </form>
      </div>
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  root: {
    alignItems: 'center',
    background: '#eeeeee',
    color: '#222222',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  form: {
    marginTop: theme.spacing.wide,
  },
  submit: {
    marginLeft: theme.spacing.normal,
  },
}));

export default Welcome;
