import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Stack, Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';

const PrivateRoute = ({ component: Component, roles = [], ...rest }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get auth token from cookie
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1];

        if (!authToken) {
          setIsAuthorized(false);
          return;
        }

        // Get user info from localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setIsAuthorized(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const userRole = user.roleId || 0;

        // Check if user role is in allowed roles
        setIsAuthorized(roles.length === 0 || roles.includes(userRole));
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError('Error checking authorization. Please try logging in again.');
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [roles]);

  if (isAuthorized === null) {
    // Show loading spinner while checking authorization
    return (
      <Stack 
        horizontalAlign="center" 
        verticalAlign="center" 
        style={{ height: '100vh' }}
      >
        <Spinner size={SpinnerSize.large} label="Checking authorization..." />
      </Stack>
    );
  }

  if (authError) {
    // Show error message if authorization check failed
    return (
      <Stack 
        horizontalAlign="center" 
        verticalAlign="center" 
        style={{ height: '100vh', padding: '0 20px' }}
      >
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          onDismiss={() => setAuthError(null)}
          dismissButtonAriaLabel="Close"
          style={{ maxWidth: '600px' }}
        >
          {authError}
        </MessageBar>
      </Stack>
    );
  }

  return (
    <Route
      {...rest}
      render={props => 
        isAuthorized ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/account/login",
              state: { from: props.location, message: "Please log in to access this page" }
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;