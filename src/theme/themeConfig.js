import { createTheme, loadTheme } from '@fluentui/react';

// Define custom theme colors and settings
export const moneyGrowTheme = createTheme({
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#f3f9fd',
    themeLighter: '#d0e7f8',
    themeLight: '#a9d3f2',
    themeTertiary: '#5ca9e5',
    themeSecondary: '#1a86d9',
    themeDarkAlt: '#006cbe',
    themeDark: '#005ba1',
    themeDarker: '#004377',
    neutralLighterAlt: '#faf9f8',
    neutralLighter: '#f3f2f1',
    neutralLight: '#edebe9',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralQuaternary: '#d0d0d0',
    neutralTertiaryAlt: '#c8c6c4',
    neutralTertiary: '#a19f9d',
    neutralSecondary: '#605e5c',
    neutralPrimaryAlt: '#3b3a39',
    neutralPrimary: '#323130',
    neutralDark: '#201f1e',
    black: '#000000',
    white: '#ffffff',
  },
  fonts: {
    // You can customize font families if needed
    medium: {
      fontFamily: "'Segoe UI', 'Segoe UI Web (West European)', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
    }
  },
  effects: {
    elevation4: '0 1.6px 3.6px 0 rgba(0, 0, 0, 0.132), 0 0.3px 0.9px 0 rgba(0, 0, 0, 0.108)',
    elevation8: '0 3.2px 7.2px 0 rgba(0, 0, 0, 0.132), 0 0.6px 1.8px 0 rgba(0, 0, 0, 0.108)',
    elevation16: '0 6.4px 14.4px 0 rgba(0, 0, 0, 0.132), 0 1.2px 3.6px 0 rgba(0, 0, 0, 0.108)',
  },
});

// Common style sets that can be reused across components
export const commonStyles = {
  pageContainer: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '30px',
  },
  card: {
    padding: '20px',
    boxShadow: moneyGrowTheme.effects.elevation4,
    borderRadius: '2px',
    backgroundColor: moneyGrowTheme.palette.white,
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 'semibold',
    color: moneyGrowTheme.palette.neutralPrimary,
    marginBottom: '20px',
  }
};

// Initialize the theme for the application
export const initializeTheme = () => {
  loadTheme(moneyGrowTheme);
};

export default moneyGrowTheme;