import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import Register from './pages/Register';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="min-h-screen bg-taupe-900  text-taupe-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/registracija" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;