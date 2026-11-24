import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Menu from "./components/menu/Menu";
import About from './pages/About';
import './App.css';
import AllComponents from './components/AllComponents';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="app">
        <Menu />
        <Container className="mt-4">
          <Routes>
            <Route path="/" element={<AllComponents />} />
            <Route path="/about" element={<About />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;