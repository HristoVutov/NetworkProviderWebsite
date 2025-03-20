import React from 'react';
import { useHistory } from 'react-router-dom';
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  DefaultButton,
  mergeStyleSets,
  getTheme,
  MessageBar,
  MessageBarType,
  Icon
} from '@fluentui/react';
import Header from '../common/Header';

const theme = getTheme();

const styles = mergeStyleSets({
  container: {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  icon: {
    fontSize: '72px',
    color: theme.palette.red,
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'semibold',
    marginBottom: '16px',
  },
  description: {
    fontSize: '16px',
    marginBottom: '32px',
    color: theme.palette.neutralSecondary,
  },
  buttonsContainer: {
    marginTop: '24px',
  },
});

const Unauthorized = () => {
  const history = useHistory();

  const handleGoHome = () => {
    history.push('/');
  };

  const handleLogin = () => {
    history.push('/account/login');
  };

  return (
    <>
      <Header />
      <Stack className={styles.container} horizontalAlign="center">
        <Icon iconName="BlockedSite" className={styles.icon} />
        
        <Text className={styles.title}>Access Denied</Text>
        
        <Text className={styles.description}>
          You don't have permission to access this page. 
          If you believe this is an error, please contact your administrator.
        </Text>
        
        <MessageBar
          messageBarType={MessageBarType.severeWarning}
          isMultiline={false}
          style={{ maxWidth: '600px', marginBottom: '32px' }}
        >
          Your current user role doesn't have sufficient privileges to view this content.
        </MessageBar>
        
        <Stack horizontal tokens={{ childrenGap: 10 }} className={styles.buttonsContainer}>
          <PrimaryButton text="Go to Home" onClick={handleGoHome} />
          <DefaultButton text="Login with Different Account" onClick={handleLogin} />
        </Stack>
      </Stack>
    </>
  );
};

export default Unauthorized;