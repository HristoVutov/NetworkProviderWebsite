import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import {
  Stack,
  Text,
  TextField,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  mergeStyles,
  getTheme
} from '@fluentui/react';
import Header from '../common/Header';

const theme = getTheme();

// Styles
const styles = {
  container: mergeStyles({
    maxWidth: '450px',
    margin: '50px auto',
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: theme.effects.elevation8,
    borderRadius: '2px',
  }),
  header: mergeStyles({
    marginBottom: '24px',
  }),
  button: mergeStyles({
    marginTop: '24px',
  }),
  spinnerContainer: mergeStyles({
    marginLeft: '10px',
  }),
  errorMessage: mergeStyles({
    marginTop: '16px',
  }),
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Make login request
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      // Extract token and user data
      const { 'auth-token': authToken, RoleId, Name, Id } = response.data;

      // Store auth token in cookies (with HttpOnly for security)
      document.cookie = `auth-token=${authToken}; path=/; max-age=86400`; // 24 hours

      // Store user info in localStorage (without sensitive data)
      localStorage.setItem('user', JSON.stringify({
        name: Name,
        id: Id,
        roleId: RoleId
      }));

      // Redirect to home page
      history.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Stack className={styles.container}>
        <Stack className={styles.header}>
          <Text variant="xLarge" block>
            Login to your account
          </Text>
          <Text variant="medium">
            Enter your email and password to access the application
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack tokens={{ childrenGap: 15 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e, newValue) => setEmail(newValue)}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e, newValue) => setPassword(newValue)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              canRevealPassword
            />

            {error && (
              <MessageBar
                className={styles.errorMessage}
                messageBarType={MessageBarType.error}
                isMultiline={false}
                dismissButtonAriaLabel="Close"
                onDismiss={() => setError('')}
              >
                {error}
              </MessageBar>
            )}

            <PrimaryButton
              className={styles.button}
              type="submit"
              disabled={isLoading}
              text={isLoading ? "Logging in" : "Login"}
            >
              {isLoading && (
                <Spinner 
                  className={styles.spinnerContainer} 
                  size={SpinnerSize.small} 
                />
              )}
            </PrimaryButton>
          </Stack>
        </form>
      </Stack>
    </>
  );
};

export default Login;