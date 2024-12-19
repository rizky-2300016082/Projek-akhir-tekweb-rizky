// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateAccount from './components/CreateAccount';
import Welcome from './components/Welcome';
import CreateBudget from './components/BudgetPage';
import BudgetPage from './components/BudgetPage';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<CreateAccount />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/create-budget" element={<CreateBudget />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/" element={<BudgetPage />} />
          <Route path="/create-account" element={<CreateAccount />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
