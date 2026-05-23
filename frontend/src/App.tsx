import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import CharacterCreate from './pages/CharacterCreate';
import Dashboard from './pages/Dashboard';
import Battle from './pages/Battle';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CharacterCreate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
