import React, { ReactNode } from 'react';
import './App.css';
import GameTester from './game-tester/GameTester';
import CustomComponent from './custom/CustomComponent';
import NormalComponent from './normal/NormalComponent';
import MainComponent from './main/MainComponent';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import SupportComponent from './support/SupportComponent';

function App() {
  return (
    <div className="Game-container">
    <Router>
      <Route exact path="/" component={MainComponent} />
      <Route path="/normal" component={NormalComponent} />
      <Route path="/custom" component={CustomComponent} />
      <Route path="/test" component={GameTester} />
      <Route path="/support" component={SupportComponent} />
    </Router>
  </div>
  );
}

export default App;
