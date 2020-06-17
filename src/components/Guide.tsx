import React from 'react';
import { createUseStyles, useTheme } from 'react-jss';

import { Modal } from 'components/ui';
import { Theme } from 'themes';

const Guide = () => {
  const classes = useStyles({ theme: useTheme() });

  const [show, setShow] = React.useState<boolean>(true);
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header>
        <Modal.Title>Quick start guide</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Welcome to Wireplace! Here are some quick tips to help you get
          started.
        </p>

        <ul className={classes.lines}>
          <li>Click anywhere to move your avatar</li>
          <li>Scroll to zoom in and out</li>
          <li>Drag to look around the room</li>
          <li>
            Press <span className={classes.key}>1</span> to{' '}
            <span className={classes.key}>9</span> to perform an emote
          </li>
          <li>
            Press <span className={classes.key}>Enter</span> to chat
          </li>
          <li>
            Click on the microphone button on the top left of the screen to join
            voice chat
          </li>
          <li>
            Press <span className={classes.key}>G</span> then click to select
            and move the furnitures, or press{' '}
            <span className={classes.key}>R</span> to rotate them
          </li>
        </ul>

        <p>
          Note that voice chat volume adjusts dynamically based on your distance
          from the other users.
        </p>
      </Modal.Body>
    </Modal>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  lines: {
    marginTop: 16,
    lineHeight: 2.5,
  },
  key: {
    padding: '2px 6px',
    borderRadius: 2,
    background: '#ccc',
    color: '#333',
    fontWeight: 'bold',
  },
}));

export default Guide;
