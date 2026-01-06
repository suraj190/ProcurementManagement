import { Routes, Route, Link, useLocation } from 'react-router-dom';
import MastersPage from './pages/MastersPage';
import RequisitionsPage from './pages/RequisitionsPage';
import StorePage from './pages/StorePage';
import ProcurementPage from './pages/ProcurementPage';

function App() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">Plant Inventory &amp; Procurement</div>
        <nav className="nav-links">
          <Link to="/" style={{ borderColor: isActive('/') ? 'rgba(129, 140, 248, 0.8)' : 'transparent' }}>
            Dashboard
          </Link>
          <Link to="/requisitions" style={{ borderColor: isActive('/requisitions') ? 'rgba(129, 140, 248, 0.8)' : 'transparent' }}>
            Requisitions
          </Link>
          <Link to="/store" style={{ borderColor: isActive('/store') ? 'rgba(129, 140, 248, 0.8)' : 'transparent' }}>
            Store
          </Link>
          <Link to="/procurement" style={{ borderColor: isActive('/procurement') ? 'rgba(129, 140, 248, 0.8)' : 'transparent' }}>
            Procurement
          </Link>
          <Link to="/masters" style={{ borderColor: isActive('/masters') ? 'rgba(129, 140, 248, 0.8)' : 'transparent' }}>
            Masters
          </Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<div>Dashboard (to be implemented)</div>} />
          <Route path="/requisitions" element={<RequisitionsPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/masters" element={<MastersPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


