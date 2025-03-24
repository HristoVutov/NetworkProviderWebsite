import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import {
  CommandBar,
  Stack,
  mergeStyleSets,
  getTheme,
  DefaultButton,
  Icon
} from '@fluentui/react';

const theme = getTheme();

const styles = mergeStyleSets({
  header: {
    background: theme.palette.themeDarker,
    padding: '10px 20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  title: {
    color: theme.palette.white,
    fontSize: '20px',
    fontWeight: 'bold',
    marginRight: '40px',
    cursor: 'pointer',
  },
  authButton: {
    marginLeft: 'auto',
    minWidth: '100px',
  },
  commandBarContainer: {
    flexGrow: 1,
  },
  userName: {
    color: theme.palette.white,
    marginRight: '10px',
  }
});

const Header = ({ history }) => {
  const [user, setUser] = useState(null);
  
  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

   // CommandBar items for navigation
   const _items = [
    {
      key: 'home',
      text: 'Home',
      iconProps: { iconName: 'Home' },
      onClick: () => history.push('/'),
    },
    {
      key: 'providerMap',
      text: 'Provider Map',
      iconProps: { iconName: 'MapPin' },
      onClick: () => history.push('/provider-map'),
    },
    {
      key: 'customers',
      text: 'Customers',
      iconProps: { iconName: 'People' },
      onClick: () => history.push('/customers'),
    },
  ];

  const handleLogout = () => {
    // Clear auth token from cookies
    document.cookie = 'auth-token=; path=/; max-age=0';
    
    // Clear user info from localStorage
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
    
    // Redirect to home
    history.push('/');
  };
  
  const handleLogin = () => {
    history.push('/account/login');
  };

  const handleTitleClick = () => {
    history.push('/');
  };

  return (
    <Stack horizontal verticalAlign="center" className={styles.header}>
      <div className={styles.title} onClick={handleTitleClick}>Money Grow</div>
      
      <div className={styles.commandBarContainer}>
        <CommandBar
          items={_items}
          ariaLabel="Navigation menu"
          styles={{
            root: {
              backgroundColor: 'transparent',
              padding: 0,
            },
            subComponentStyles: {
              menuItem: {
                root: {
                  color: theme.palette.white,
                  selectors: {
                    ':hover': {
                      color: theme.palette.themePrimary,
                      backgroundColor: 'transparent',
                    },
                  },
                },
                icon: {
                  color: theme.palette.white,
                },
              },
            },
          }}
        />
      </div>
      
      {user ? (
        <Stack horizontal verticalAlign="center">
          <span className={styles.userName}>
            Hello, {user.name}
          </span>
          <DefaultButton
            className={styles.authButton}
            text="Logout"
            onClick={handleLogout}
            iconProps={{ iconName: 'SignOut' }}
          />
        </Stack>
      ) : (
        <DefaultButton
          className={styles.authButton}
          text="Login"
          onClick={handleLogin}
          iconProps={{ iconName: 'ContactInfo' }}
        />
      )}
    </Stack>
  );
};

export default withRouter(Header);