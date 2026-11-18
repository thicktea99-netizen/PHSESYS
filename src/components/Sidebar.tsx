// src/components/Sidebar.tsx
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, AlertTriangle, ClipboardCheck, AlertCircle, 
  MessageSquare, FileText, Shield, FileCheck, GraduationCap, 
  FolderOpen, Settings, Users, ChevronDown, ChevronRight, Wrench, 
  ShieldAlert, FileSearch, Siren, Phone 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    operations: false,
    people: false,
    compliance: false,
    emergency: false
  });

  useEffect(() => {
    if (location.pathname.startsWith('/inspections') || location.pathname.startsWith('/hazards') || location.pathname.startsWith('/permits') || location.pathname.startsWith('/ppe-checks') || location.pathname.startsWith('/equipment') || location.pathname.startsWith('/risk-assessments') || location.pathname.startsWith('/man-hours')) {
      setOpenGroups(prev => ({ ...prev, operations: true }));
    }
    if (location.pathname.startsWith('/people') || location.pathname.startsWith('/toolbox-talks') || location.pathname.startsWith('/training')) {
      setOpenGroups(prev => ({ ...prev, people: true }));
    }
    if (location.pathname.startsWith('/compliance') || location.pathname.startsWith('/documents') || location.pathname.startsWith('/audits')) {
      setOpenGroups(prev => ({ ...prev, compliance: true }));
    }
    if (location.pathname.startsWith('/drills') || location.pathname.startsWith('/emergency-contacts')) {
      setOpenGroups(prev => ({ ...prev, emergency: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const isGroupActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Shield size={28} color="#2563eb" />
        <span>HSE Manager</span>
      </div>

      <nav className="sidebar-nav">
        {/* DASHBOARD */}
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        {/* INCIDENTS */}
        <Link to="/incidents" className={`nav-item ${location.pathname.startsWith('/incidents') ? 'active' : ''}`}>
          <AlertTriangle size={20} />
          <span>Incidents</span>
        </Link>

        {/* OPERATIONS GROUP */}
        <div className="nav-group">
          <button 
            className={`nav-item group-header ${isGroupActive(['/inspections', '/hazards', '/permits', '/ppe-checks', '/equipment', '/risk-assessments', '/man-hours']) || openGroups.operations ? 'active-group' : ''}`}
            onClick={() => toggleGroup('operations')}
          >
            <FolderOpen size={20} />
            <span>Operations</span>
            {openGroups.operations ? <ChevronDown size={16} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
          </button>
          
          {openGroups.operations && (
            <div className="nav-sub-group">
              <Link to="/inspections" className={`nav-item ${location.pathname.startsWith('/inspections') ? 'active' : ''}`}>
                <ClipboardCheck size={18} />
                <span>Inspections</span>
              </Link>
              <Link to="/hazards" className={`nav-item ${location.pathname.startsWith('/hazards') ? 'active' : ''}`}>
                <AlertCircle size={18} />
                <span>Hazards</span>
              </Link>
              <Link to="/permits" className={`nav-item ${location.pathname.startsWith('/permits') ? 'active' : ''}`}>
                <FileText size={18} />
                <span>Permits</span>
              </Link>
              <Link to="/ppe-checks" className={`nav-item ${location.pathname.startsWith('/ppe-checks') ? 'active' : ''}`}>
                <Shield size={18} />
                <span>PPE Checks</span>
              </Link>
              <Link to="/equipment" className={`nav-item ${location.pathname.startsWith('/equipment') ? 'active' : ''}`}>
                <Wrench size={18} />
                <span>Equipment</span>
              </Link>
              <Link to="/risk-assessments" className={`nav-item ${location.pathname.startsWith('/risk-assessments') ? 'active' : ''}`}>
                <ShieldAlert size={18} />
                <span>Risk Assessments</span>
              </Link>
              <Link to="/man-hours" className={`nav-item ${location.pathname.startsWith('/man-hours') ? 'active' : ''}`}>
                <FileText size={18} />
                <span>Man-Hours Log</span>
              </Link>
            </div>
          )}
        </div>

        {/* PEOPLE & COMPETENCY GROUP */}
        <div className="nav-group">
          <button 
            className={`nav-item group-header ${isGroupActive(['/people', '/toolbox-talks', '/training']) || openGroups.people ? 'active-group' : ''}`}
            onClick={() => toggleGroup('people')}
          >
            <Users size={20} />
            <span>People & Competency</span>
            {openGroups.people ? <ChevronDown size={16} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
          </button>
          
          {openGroups.people && (
            <div className="nav-sub-group">
              <Link to="/people" className={`nav-item ${location.pathname.startsWith('/people') ? 'active' : ''}`}>
                <Users size={18} />
                <span>People & Contractors</span>
              </Link>
              <Link to="/toolbox-talks" className={`nav-item ${location.pathname.startsWith('/toolbox-talks') ? 'active' : ''}`}>
                <MessageSquare size={18} />
                <span>Toolbox Talks</span>
              </Link>
              <Link to="/training" className={`nav-item ${location.pathname.startsWith('/training') ? 'active' : ''}`}>
                <GraduationCap size={18} />
                <span>Certifications</span>
              </Link>
            </div>
          )}
        </div>

        {/* COMPLIANCE GROUP */}
        <div className="nav-group">
          <button 
            className={`nav-item group-header ${isGroupActive(['/compliance', '/documents', '/audits']) || openGroups.compliance ? 'active-group' : ''}`}
            onClick={() => toggleGroup('compliance')}
          >
            <FileCheck size={20} />
            <span>Compliance & Docs</span>
            {openGroups.compliance ? <ChevronDown size={16} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
          </button>
          
          {openGroups.compliance && (
            <div className="nav-sub-group">
              <Link to="/compliance" className={`nav-item ${location.pathname.startsWith('/compliance') ? 'active' : ''}`}>
                <FileCheck size={18} />
                <span>Compliance Register</span>
              </Link>
              <Link to="/documents" className={`nav-item ${location.pathname.startsWith('/documents') ? 'active' : ''}`}>
                <FolderOpen size={18} />
                <span>Library</span>
              </Link>
              <Link to="/audits" className={`nav-item ${location.pathname.startsWith('/audits') ? 'active' : ''}`}>
                <FileSearch size={18} />
                <span>Audits</span>
              </Link>
            </div>
          )}
        </div>

        {/* EMERGENCY PREPAREDNESS GROUP */}
        <div className="nav-group">
          <button 
            className={`nav-item group-header ${isGroupActive(['/drills', '/emergency-contacts']) || openGroups.emergency ? 'active-group' : ''}`}
            onClick={() => toggleGroup('emergency')}
          >
            <Siren size={20} />
            <span>Emergency Prep.</span>
            {openGroups.emergency ? <ChevronDown size={16} style={{ marginLeft: 'auto' }} /> : <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
          </button>
          
          {openGroups.emergency && (
            <div className="nav-sub-group">
              <Link to="/drills" className={`nav-item ${location.pathname.startsWith('/drills') ? 'active' : ''}`}>
                <Siren size={18} />
                <span>Drills & Exercises</span>
              </Link>
              <Link to="/emergency-contacts" className={`nav-item ${location.pathname.startsWith('/emergency-contacts') ? 'active' : ''}`}>
                <Phone size={18} />
                <span>Emergency Contacts</span>
              </Link>
            </div>
          )}
        </div>

        {/* SETTINGS (Pushed to bottom) */}
        <div style={{ marginTop: 'auto', paddingBottom: '20px' }}>
          <Link to="/settings" className={`nav-item ${location.pathname.startsWith('/settings') ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>

      </nav>
    </div>
  );
}