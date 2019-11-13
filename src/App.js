import React, { Component } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
let Router = BrowserRouter;
class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
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
