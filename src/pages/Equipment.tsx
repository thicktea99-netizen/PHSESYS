// src/pages/Equipment.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, ClipboardCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Equipment {
  id: string;
  equipment_number: number;
  name: string;
  type: string;
  site: string;
  status: string;
  assigned_to_name: string;
  next_inspection_due: string;
  photo_url: string;
}

export default function Equipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchEquipment(); }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setEquipment(data || []);
    } catch (error: any) {
      alert("Error fetching equipment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setEquipment(equipment.map(e => e.id === id ? { ...e, status: newStatus } : e));
    await supabase.from('equipment').update({ status: newStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this equipment record?")) return;
    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
      setEquipment(equipment.filter(e => e.id !== id));
    } catch (error: any) { alert(error.message); }
  };

  const handleLogInspection = (equipName: string, siteName: string) => {
    // Navigate to inspection form with pre-filled data using URL params
    navigate(`/inspections/new?equipment=${encodeURIComponent(equipName)}&site=${encodeURIComponent(siteName)}`);
  };

  const getInspectionStatus = (dueDate: string) => {
    if (!dueDate) return { label: 'No Date', color: 'severity-low' };
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', color: 'severity-critical' };
    if (diffDays <= 7) return { label: 'Due Soon', color: 'severity-high' };
    return { label: 'Current', color: 'severity-low' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Equipment & Tools Register</h1>
          <p className="page-subtitle">Track site equipment, tools, and inspection dates.</p>
        </div>
        <Link to="/equipment/new" className="btn-primary"><Plus size={18} /> Register Equipment</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Site</th>
              <th>Assigned To</th>
              <th>Next Inspection</th>
              <th>Status</th>
              <th style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="table-message">Loading equipment...</td></tr>
            ) : equipment.length === 0 ? (
              <tr><td colSpan={8} className="table-message">No equipment registered yet.</td></tr>
            ) : (
              equipment.map((item) => {
                const inspStatus = getInspectionStatus(item.next_inspection_due);
                return (
                  <tr key={item.id}>
                    <td className="font-medium">EQP-{String(item.equipment_number).padStart(4, '0')}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.site || '-'}</td>
                    <td>{item.assigned_to_name || '-'}</td>
                    <td>
                      {item.next_inspection_due ? (
                        <div>
                          <div>{new Date(item.next_inspection_due).toLocaleDateString()}</div>
                          <span className={`badge ${inspStatus.color}`} style={{ fontSize: '0.6rem' }}>{inspStatus.label}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <select value={item.status} onChange={(e) => updateStatusInline(item.id, e.target.value)} className={`table-select status-${item.status.toLowerCase().replace(' ', '-')}`}>
                        <option value="In Service">In Service</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Under Repair">Under Repair</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon" title="Log Inspection" onClick={() => handleLogInspection(item.name, item.site)} style={{ color: 'var(--primary)' }}>
                        <ClipboardCheck size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}