import React from "react";
import { useHistory } from "react-router-dom";
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  Image, 
  mergeStyleSets, 
  getTheme,
  DefaultButton,
  Icon
} from '@fluentui/react';
import Header from "../common/Header";

const theme = getTheme();

// Styles using Fluent UI styling system
const styles = mergeStyleSets({
  container: {
    padding: '0 20px',
    color: theme.palette.neutralPrimary,
  },
  hero: {
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '60px',
  },
  heroContent: {
    maxWidth: '600px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: theme.palette.themePrimary,
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '24px',
    lineHeight: '28px',
  },
  feature: {
    padding: '20px',
    backgroundColor: theme.palette.neutralLighter,
    borderRadius: '2px',
    margin: '10px',
    transition: 'all 0.2s ease',
    selectors: {
      ':hover': {
        boxShadow: theme.effects.elevation8,
      }
    }
  },
  featureIcon: {
    fontSize: '28px',
    color: theme.palette.themePrimary,
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 'semibold',
    marginBottom: '8px',
  },
  section: {
    marginBottom: '60px',
  }
});

const Home = () => {
  const history = useHistory();

  const handleMapClick = () => {
    history.push('/provider-map');
  };

  const handleLoginClick = () => {
    history.push('/account/login');
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Hero Section */}
        <Stack horizontal className={styles.hero}>
          <Stack className={styles.heroContent}>
            <Text className={styles.title}>Money Grow</Text>
            <Text className={styles.subtitle}>
              Discover financial growth opportunities through our comprehensive provider network 
              and advanced market insights.
            </Text>
            <Stack horizontal tokens={{ childrenGap: 15 }}>
              <PrimaryButton text="View Provider Map" onClick={handleMapClick} />
              <DefaultButton text="Learn More" iconProps={{ iconName: 'ChevronRight' }} />
            </Stack>
          </Stack>
        </Stack>

        {/* Features Section */}
        <Stack className={styles.section}>
          <Text variant="xLarge" style={{ marginBottom: '24px', fontWeight: 'semibold' }}>
            Our Features
          </Text>
          
          <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
            <Stack className={styles.feature} grow={1} basis={0}>
              <Icon iconName="Map" className={styles.featureIcon} />
              <Text className={styles.featureTitle}>Provider Network</Text>
              <Text>
                Visualize and connect with our extensive provider network across the globe.
                Track real-time connections and market activity.
              </Text>
            </Stack>
            
            <Stack className={styles.feature} grow={1} basis={0}>
              <Icon iconName="Money" className={styles.featureIcon} />
              <Text className={styles.featureTitle}>Financial Insights</Text>
              <Text>
                Access comprehensive financial data and insights to make informed investment decisions.
              </Text>
            </Stack>
            
            <Stack className={styles.feature} grow={1} basis={0}>
              <Icon iconName="SecurityGroup" className={styles.featureIcon} />
              <Text className={styles.featureTitle}>Secure Platform</Text>
              <Text>
                Rest easy with our enterprise-grade security measures protecting your data and transactions.
              </Text>
            </Stack>
          </Stack>
        </Stack>

        {/* Call to Action */}
        <Stack 
          horizontal 
          horizontalAlign="center" 
          verticalAlign="center" 
          className={styles.section}
          styles={{
            root: {
              backgroundColor: theme.palette.themeLighterAlt,
              padding: '40px',
              borderRadius: '4px',
            }
          }}
        >
          <Stack horizontalAlign="center" tokens={{ childrenGap: 16 }}>
            <Text variant="xLarge" style={{ fontWeight: 'semibold' }}>
              Ready to get started?
            </Text>
            <Text style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '20px' }}>
              Join our platform today and discover how Money Grow can help you maximize your financial potential.
            </Text>
            <PrimaryButton text="Create Account" onClick={handleLoginClick} />
          </Stack>
        </Stack>
      </div>
    </>
  );
};

export default Home;