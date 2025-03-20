import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { initializeIcons } from '@fluentui/react';
import { moneyGrowTheme, initializeTheme } from "./theme/themeConfig";
import Home from "./components/home/Home";
import ProviderMap from "./components/provider/ProviderMap";
import Login from "./components/account/Login";
import Unauthorized from "./components/common/Unauthorized";

// Inside Switch
// Initialize FluentUI icons
initializeIcons();

function App() {
  // Initialize the theme when the app loads
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <Switch>
      <Route exact path="/" component={Home} />      
      <Route path="/provider-map" component={ProviderMap} />
      <Route path="/account/login" component={Login} />
      <Route path="/unauthorized" component={Unauthorized} />
    </Switch>
  );
}

export default App;