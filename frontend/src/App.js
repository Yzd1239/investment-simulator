import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

//Import Pages
import { Watchlist, Portfolio, NewsPage } from "./Pages";
import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/signup" />} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/signin" component={SignIn} />
        <Route exact path="/watchlist" component={Watchlist} />
        <Route exact path="/portfolio" component={Portfolio} />
        <Route exact path="/news" component={NewsPage} />
        <Route exact path="/news/:stock" component={NewsPage} />
      </Switch>
    </Router>
  );
}

export default App;
