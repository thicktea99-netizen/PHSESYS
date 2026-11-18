// src/pages/ToolboxTalks.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Inspections.css';

interface Talk {
  id: string;
  talk_number: number;
  topic: string;
  site: string;
  date: string;
  presenter_name: string;
  attendee_count: number;
}

export default function ToolboxTalks() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTalks(); }, []);

  const fetchTalks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('toolbox_talks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTalks(data || []);
    } catch (error: any) {
      alert("Error fetching talks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this talk?")) return;
    try {
      const { error } = await supabase.from('toolbox_talks').delete().eq('id', id);
      if (error) throw error;
      setTalks(talks.filter(t => t.id !== id));
    } catch (error: any) {
      alert("Error deleting talk: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Toolbox Talks & Briefings</h1>
          <p className="page-subtitle">Track safety briefings and attendee records.</p>
        </div>
        <Link to="/toolbox-talks/new" className="btn-primary"><Plus size={18} /> Log Talk</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Topic</th>
              <th>Site</th>
              <th>Date</th>
              <th>Presenter</th>
              <th>Attendees</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading talks...</td></tr>
            ) : talks.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No toolbox talks logged yet. Click "Log Talk" to add one.</td></tr>
            ) : (
              talks.map((talk) => (
                <tr key={talk.id} className="clickable-row">
                  <td className="font-medium">TBT-{String(talk.talk_number).padStart(4, '0')}</td>
                  <td>{talk.topic}</td>
                  <td>{talk.site}</td>
                  <td>{talk.date}</td>
                  <td>{talk.presenter_name}</td>
                  <td>{talk.attendee_count || 0}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon danger" onClick={() => handleDelete(talk.id)}><Trash2 size={16} /></button>
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