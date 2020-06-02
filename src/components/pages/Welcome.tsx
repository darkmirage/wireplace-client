import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Icon, Input, InputGroup, Tooltip } from 'components/ui';
import { Theme } from 'themes';

type Props = {
  onEnterUsername: (username: string) => void;
};

const Welcome = (props: Props) => {
  const classes = useStyles({ theme: useTheme() });
  const [text, setText] = React.useState('');

  const handleSubmit = (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();
    if (text) {
      props.onEnterUsername(text);
    }
  };

  return (
    <div className={classes.root}>
      <h1>WirePlace</h1>
      <div>Enter a username to chat</div>
      <div>
        <form className={classes.form} onSubmit={handleSubmit}>
          <InputGroup inside>
            <Input
              focused
              onValueChange={setText}
              placeholder="Your username"
              tabIndex={1}
            />
            <Tooltip content="Enter">
              <InputGroup.Button onClick={handleSubmit}>
                <Icon icon="sign-in" />
              </InputGroup.Button>
            </Tooltip>
          </InputGroup>
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
}));

export default Welcome;
