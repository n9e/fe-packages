import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import auth from './auth';

interface Props {
  component: typeof React.Component,
  rootVisible?: boolean,
}

const PrivateRoute: React.FC<Props & RouteProps> = ({ component: Component, rootVisible = false, ...rest }) => {
  const { isroot } = auth.getSelftProfile();
  const isAuthenticated = auth.getIsAuthenticated();
  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated) {
          if (rootVisible && !isroot) {
            return (
              <Redirect
                to={{
                  pathname: '/403',
                }}
              />
            );
          }
          return <Component {...props} />;
        }
        return (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }, // eslint-disable-line react/prop-types
            }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
