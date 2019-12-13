import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Main } from "./renderer/screens";
class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route
              path="/"
              component={Main}
            />
            <Route
              render={() => {
                return <div>Heya from react on electron</div>;
              }}
            />
          </Switch>
        </Router>
      </div>
    );
  }
}
export default App;
