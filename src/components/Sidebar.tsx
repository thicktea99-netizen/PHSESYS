// src/components/Sidebar.tsx
import { LayoutDashboard, AlertTriangle, ClipboardCheck, ShieldAlert, BookOpen } from 'lucide-react';
import '../styles/Sidebar.css'; // We will create this next

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <ShieldAlert size={28} color="#2563eb" />
        <span>HSE Manager</span>
      </div>

      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <AlertTriangle size={20} />
          <span>Incidents</span>
        </a>
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