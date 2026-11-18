

// src/pages/Capa.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Capa.css';

interface CapaAction {
  id: string;
  capa_number: number;
  action_title: string;
  source_type: string;
  priority: string;
  owner: string;
  due_date: string;
  status: string;
}

export default function Capa() {
  const [actions, setActions] = useState<CapaAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('capa_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error: any) {
      alert("Error fetching CAPA actions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatusInline = async (id: string, newStatus: string) => {
    setActions(actions.map(a => a.id === id ? { ...a, status: newStatus } : a));
    
    const { error } = await supabase
      .from('capa_actions')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("Failed to update status: " + error.message);
      fetchActions();
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this CAPA action? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('capa_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setActions(actions.filter(a => a.id !== id));
    } catch (error: any) {
      alert("Error deleting action: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>CAPA Tracker</h1>
          <p className="page-subtitle">Track corrective and preventive actions to closure.</p>
        </div>
        <Link to="/capa/new" className="btn-primary">
          <Plus size={18} />
          Raise Action
        </Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>CAPA ID</th>
              <th>Action Title</th>
              <th>Source</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="table-message">Loading actions...</td>
              </tr>
            ) : actions.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-message">No CAPA actions yet. Click "Raise Action" to add one.</td>
              </tr>
            ) : (
              actions.map((action) => (
                <tr key={action.id}>
                  <td 
                    className="table-link" 
                    onClick={() => window.location.href = `/capa/${action.id}`}
                  >
                    CAPA-{String(action.capa_number).padStart(4, '0')}
                  </td>
                  <td>{action.action_title}</td>
                  <td>{action.source_type}</td>
                  <td>
                    <span className={`badge severity-${action.priority === 'Critical' ? 'critical' : action.priority === 'High' ? 'high' : 'medium'}`}>
                      {action.priority}
                    </span>
                  </td>
                  <td>{action.owner}</td>
                  <td>{action.due_date}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={action.status} 
                      onChange={(e) => updateStatusInline(action.id, e.target.value)}
                      className={`table-select status-${action.status.replace(' ', '-')}`}
                    >
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => handleDelete(action.id)}
                      title="Delete Action"
                    >
                      <Trash2 size={16} />
                    </button>
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