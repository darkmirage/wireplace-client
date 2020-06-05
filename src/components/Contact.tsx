import React from 'react';
import { createUseStyles } from 'react-jss';

type Props = {
  compact?: boolean;
};

const Contact = ({ compact = false }: Props) => {
  const classes = useStyles();

  if (compact) {
    return (
      <div className={classes.contact}>
        <a href="mailto:admin@wireplace.net">Feedback?</a>
      </div>
    );
  }

  return (
    <div className={classes.contact}>
      For suggestions and feedback, please email{' '}
      <a href="mailto:admin@wireplace.net">admin@wireplace.net</a>.
    </div>
  );
};

const useStyles = createUseStyles({
  contact: {
    marginTop: '100px',
    color: '#999',
    '& a': {
      color: '#333',
      fontWeight: 'bold',
      pointerEvents: 'auto',
    },
  },
});

export default Contact;
