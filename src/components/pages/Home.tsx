import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { createUseStyles, useTheme } from 'react-jss';

import Contact from 'components/Contact';
import { Panel, Message } from 'components/ui';
import JoinChannel from 'components/JoinChannel';
import Unverified from 'components/auth/Unverified';
import { PageProps } from 'components/auth/PageProps';
import { Theme } from 'themes';

const Home = (props: PageProps) => {
  const classes = useStyles({ theme: useTheme() });
  return (
    <div>
      <div className={classes.topContainer}>
        <video
          className={classes.video}
          src="https://wireplace-assets.s3-us-west-1.amazonaws.com/videos/background.mp4"
          poster="https://wireplace-assets.s3-us-west-1.amazonaws.com/videos/background.jpg"
          muted
          autoPlay
          loop
        />
        <div className={classes.content}>
          <Panel className={classes.panel}>
            <div className={classes.row}>
              <h1>Wireplace.</h1>
              <div>
                <i>noun</i> - waɪərˌpleɪs
              </div>
              <div className={classes.blurb}>
                <p>
                  An online venue for virtual gatherings. Catch up with your
                  friends or meet with your teammates in your favorite space.
                </p>
                <p>
                  Runs entirely in your browser with no additional software.
                  Perfect for conferences, celebrations, events, and games.
                </p>
              </div>
            </div>
            <div className={classes.row}>
              <Switch>
                <Route exact path="/" component={JoinChannel} />
                <Route exact path="/unverified" component={Unverified} />
                <Route
                  exact
                  path="/waitlist"
                  component={() => (
                    <Message
                      type="warning"
                      title="Please hold on"
                      description={
                        <>
                          You are still on the waitlist. We will notify you as
                          soon as more beta spots open up!
                        </>
                      }
                    />
                  )}
                />
              </Switch>
            </div>
            <div className={classes.row}>
              <Contact />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const useStyles = createUseStyles<Theme>((theme) => ({
  topContainer: {
    background: '#eeeeee',
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
  },
  video: {
    flex: 4,
    maskImage:
      'radial-gradient(circle at 50%, black 0%, black 75%, transparent 92%)',
    minHeight: 0,
    overflow: 'hidden',
    objectFit: 'cover',
  },
  content: {
    flex: 3,
    top: 0,
    zIndex: theme.zIndices.middle,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.color.backgroundLight,
    maxWidth: 640,
    minWidth: 420,
  },
  panel: {
    position: 'relative',
    zIndex: theme.zIndices.top,
    color: theme.color.textDark,
    background: theme.color.backgroundLight,
    maxWidth: 500,
    minHeight: 150,
  },
  blurb: {
    marginTop: theme.spacing.normal,
    marginBottom: theme.spacing.wide,
  },
  row: {
    marginBottom: theme.spacing.wide,
  },
  '@media (max-width: 400px)': {
    topContainer: {
      flexDirection: 'column',
    },
    content: {
      order: -1,
      maxWidth: 'none',
      minWidth: 'auto',
    },
  },
}));

export default Home;
