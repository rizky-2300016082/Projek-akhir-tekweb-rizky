import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateAccount from './components/CreateAccount';
import Welcome from './components/Welcome';
import BudgetPage from './components/BudgetPage';
import Logout from './components/Logout';
import About from './components/About';

function App() {
  return (
    <Router basename="/Projek-akhir-tekweb-rizky">
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/welcome" element={<><Navbar /><Welcome /></>} />
        <Route path="/budget" element={<><Navbar /><BudgetPage /></>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/about" element={<><Navbar /><About /></>} /> {/* Rute untuk About */}
      </Routes>
    </Router>
  );
}

export default App;
