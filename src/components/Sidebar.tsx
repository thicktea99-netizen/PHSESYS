// src/components/Sidebar.tsx
import { LayoutDashboard, AlertTriangle, ClipboardCheck, ShieldAlert, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const location = useLocation(); // Tells us what the current URL is

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <ShieldAlert size={28} color="#2563eb" />
        <span>HSE Manager</span>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard Link */}
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        {/* Incidents Link */}
        <Link to="/incidents" className={`nav-item ${location.pathname === '/incidents' ? 'active' : ''}`}>
          <AlertTriangle size={20} />
          <span>Incidents</span>
        </Link>

        {/* Placeholders for later */}
        <a href="#" className="nav-item">
          <ClipboardCheck size={20} />
          <span>Inspections</span>
        </a>
        <a href="#" className="nav-item">
          <BookOpen size={20} />
          <span>CAPA Tracker</span>
        </a>
      </nav>
    </div>
  );
}