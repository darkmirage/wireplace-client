import React from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';

import { Spinner } from 'components/ui';
import AuthenticatedContainer from './AuthenticatedContainer';

type Props = RouteProps;

const PrivateRoute = ({ component: Component, render, ...rest }: Props) => {
  return (
    <Route
      {...rest}
      render={(innerProps) => {
        return (
          <AuthenticatedContainer
            loggedOut={<Redirect to="/login" />}
            spinner={<Spinner />}
          >
            {() => {
              if (Component) {
                return <Component {...innerProps} />;
              }
              if (render) {
                return render(innerProps);
              }
              return null;
            }}
          </AuthenticatedContainer>
        );
      }}
    />
  );
};

export default PrivateRoute;
