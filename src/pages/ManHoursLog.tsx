// src/pages/ManHoursLog.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/Inspections.css';

interface Snapshot {
  id: string;
  week_start_date: string;
  total_man_hours: number;
  total_workforce: number;
  lost_time_hours: number;
  safe_man_hours: number;
  notes: string;
}

export default function ManHoursLog() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [weekStart, setWeekStart] = useState('');
  const [totalManHours, setTotalManHours] = useState('');
  const [totalWorkforce, setTotalWorkforce] = useState('');
  const [lostTimeHours, setLostTimeHours] = useState('0');
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchSnapshots(); }, []);

  const fetchSnapshots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('weekly_snapshots').select('*').order('week_start_date', { ascending: false });
      if (error) throw error;
      setSnapshots(data || []);
    } catch (error: any) {
      alert("Error fetching snapshots: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!weekStart || !totalManHours || !totalWorkforce) {
      alert("Please fill in Week Start Date, Total Man-Hours, and Workforce Count.");
      return;
    }

    const manHours = parseFloat(totalManHours);
    const lostHours = parseFloat(lostTimeHours) || 0;
    const safeHours = manHours - lostHours;

    try {
      const { error } = await supabase.from('weekly_snapshots').insert([{
        week_start_date: weekStart,
        total_man_hours: manHours,
        total_workforce: parseInt(totalWorkforce),
        lost_time_hours: lostHours,
        safe_man_hours: safeHours,
        notes
      }]);
      if (error) throw error;
      
      setWeekStart(''); setTotalManHours(''); setTotalWorkforce(''); setLostTimeHours('0'); setNotes('');
      fetchSnapshots();
    } catch (error: any) {
      alert("Error saving: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this week's data?")) return;
    await supabase.from('weekly_snapshots').delete().eq('id', id);
    fetchSnapshots();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Man-Hours Log</h1>
          <p className="page-subtitle">Enter weekly man-hours and workforce counts for KPI calculations.</p>
        </div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">Add Weekly Snapshot</h3>
        <div className="form-grid">
          <div className="form-group"><label>Week Start Date *</label><input type="date" className="form-input" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></div>
          <div className="form-group"><label>Total Man-Hours *</label><input type="number" className="form-input" value={totalManHours} onChange={(e) => setTotalManHours(e.target.value)} /></div>
          <div className="form-group"><label>Total Workforce *</label><input type="number" className="form-input" value={totalWorkforce} onChange={(e) => setTotalWorkforce(e.target.value)} /></div>
          <div className="form-group"><label>Lost Time Hours</label><input type="number" className="form-input" value={lostTimeHours} onChange={(e) => setLostTimeHours(e.target.value)} /></div>
          <div className="form-group span-2"><label>Notes</label><input type="text" className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <button className="btn-primary mt-16" onClick={handleAdd}><Plus size={18} /> Add Snapshot</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Week Start</th>
              <th>Total Man-Hours</th>
              <th>Workforce</th>
              <th>Lost Time Hours</th>
              <th>Safe Man-Hours</th>
              <th>Notes</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="table-message">Loading...</td></tr> :
              snapshots.length === 0 ? <tr><td colSpan={7} className="table-message">No snapshots yet.</td></tr> :
              snapshots.map(s => (
                <tr key={s.id}>
                  <td className="font-medium">{new Date(s.week_start_date).toLocaleDateString()}</td>
                  <td>{s.total_man_hours.toLocaleString()}</td>
                  <td>{s.total_workforce}</td>
                  <td>{s.lost_time_hours}</td>
                  <td>{s.safe_man_hours.toLocaleString()}</td>
                  <td>{s.notes || '-'}</td>
                  <td><button className="btn-icon danger" onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}