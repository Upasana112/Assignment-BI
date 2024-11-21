import React from "react";
import { BrowserRouter as Router, Route,Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddMessage from "./pages/AddMessage";


const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-message" element={<AddMessage />} />
    </Routes>
  </Router>
);

export default App;
