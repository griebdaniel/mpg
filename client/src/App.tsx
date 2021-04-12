import React, { ReactNode } from 'react';
import './App.css';
import GameTester from './game-tester/GameTester';

import NormalComponent from './normal/NormalComponent';
import MainComponent from './main/MainComponent';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import SupportComponent from './support/SupportComponent';
import PracticeGame from './game/practice/PracticeGame';
import TestGame from './game/test/TestGame';
import StandardGame from './game/standard/StandardGame';
import AdminPage from './admin/AdminPage';

function App() {
  return (
    <Router>
      <Route exact path="/" component={MainComponent} />
      <Route path="/practice" component={PracticeGame} />
      <Route path="/test" component={TestGame} />
      <Route path="/standard" component={StandardGame} />
      <Route path="/support" component={SupportComponent} />
      <Route path="/admin" component={AdminPage} />
    </Router>
  );
}

export default App;
