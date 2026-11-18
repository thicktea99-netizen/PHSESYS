// src/pages/RiskAssessments.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ShieldAlert, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface RiskAssessment {
  id: string;
  ra_number: number;
  task_name: string;
  assessment_type: string;
  site: string;
  assessor_name: string;
  date_of_assessment: string;
  status: string;
}

export default function RiskAssessments() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => { fetchAssessments(); }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('risk_assessments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      alert("Error fetching assessments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this assessment? This will also delete all steps and hazards.")) return;
    try {
      const { error } = await supabase.from('risk_assessments').delete().eq('id', id);
      if (error) throw error;
      setAssessments(assessments.filter(a => a.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Risk Management</h1>
          <p className="page-subtitle">Manage Risk Assessments (RAMS) and JSA / JHA.</p>
        </div>
        
        {/* Dropdown Button */}
        <div style={{ position: 'relative' }}>
          <button className="btn-primary" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Plus size={18} /> New Assessment <ChevronDown size={16} />
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/risk-assessments/new?type=JSA" className="dropdown-item">
                <ClipboardList size={16} /> JSA / JHA (Step-by-Step)
              </Link>
              <Link to="/risk-assessments/new?type=RAMS" className="dropdown-item">
                <ShieldAlert size={16} /> Risk Assessment (RAMS)
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Task Name</th>
              <th>Site</th>
              <th>Assessor</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="table-message">Loading assessments...</td></tr>
            ) : assessments.length === 0 ? (
              <tr><td colSpan={8} className="table-message">No assessments yet.</td></tr>
            ) : (
              assessments.map((item) => (
                <tr key={item.id} className="clickable-row" onClick={() => window.location.href = `/risk-assessments/${item.id}`}>
                  <td className="font-medium">RA-{String(item.ra_number).padStart(4, '0')}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                      {item.assessment_type}
                    </span>
                  </td>
                  <td>{item.task_name}</td>
                  <td>{item.site}</td>
                  <td>{item.assessor_name}</td>
                  <td>{new Date(item.date_of_assessment).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${item.status === 'Approved' ? 'severity-low' : item.status === 'Expired' ? 'severity-critical' : 'severity-medium'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}