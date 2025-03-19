import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Keep Bootstrap for now as we're not updating all components
import { ThemeProvider, initializeIcons } from '@fluentui/react';
import Home from "./components/home/Home";
import ProviderMap from "./components/provider/ProviderMap";

// Initialize FluentUI icons
initializeIcons();

// You can customize the theme if needed
const theme = {
  palette: {
    themePrimary: '#0078d4',
    themeLighterAlt: '#eff6fc',
    themeLighter: '#deecf9',
    themeLight: '#c7e0f4',
    themeTertiary: '#71afe5',
    themeSecondary: '#2b88d8',
    themeDarkAlt: '#106ebe',
    themeDark: '#005a9e',
    themeDarker: '#004578',
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Switch>
        <Route exact path="/" component={Home} />      
        <Route path="/provider-map" component={ProviderMap} />
      </Switch>
    </ThemeProvider>
  );
}

export default App;