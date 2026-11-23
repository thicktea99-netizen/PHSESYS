// src/pages/Projects.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/Incidents.css';

interface Project {
  id: string;
  project_name: string;
  client: string;
  main_contractor: string;
  project_manager: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newContractor, setNewContractor] = useState('');
  const [newManager, setNewManager] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      alert("Error fetching projects: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName) { alert("Enter a project name."); return; }
    await supabase.from('projects').insert([{
      project_name: newName,
      client: newClient,
      main_contractor: newContractor,
      project_manager: newManager,
      location: newLocation,
      start_date: newStartDate || null,
      end_date: newEndDate || null,
      notes: newNotes
    }]);
    setNewName(''); setNewClient(''); setNewContractor(''); setNewManager(''); setNewLocation(''); setNewStartDate(''); setNewEndDate(''); setNewNotes('');
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this project? Sites linked to it will be unlinked.")) return;
    await supabase.from('projects').delete().eq('id', id);
    fetchProjects();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">Manage projects and their details.</p>
        </div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">Add New Project</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Project Name *</label><input type="text" className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
          <div className="form-group"><label>Client</label><input type="text" className="form-input" value={newClient} onChange={(e) => setNewClient(e.target.value)} /></div>
          <div className="form-group"><label>Main Contractor</label><input type="text" className="form-input" value={newContractor} onChange={(e) => setNewContractor(e.target.value)} /></div>
          <div className="form-group"><label>Project Manager</label><input type="text" className="form-input" value={newManager} onChange={(e) => setNewManager(e.target.value)} /></div>
          <div className="form-group"><label>Location</label><input type="text" className="form-input" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} /></div>
          <div className="form-group"><label>Start Date</label><input type="date" className="form-input" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} /></div>
          <div className="form-group"><label>End Date</label><input type="date" className="form-input" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} /></div>
          <div className="form-group span-2"><label>Notes</label><input type="text" className="form-input" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} /></div>
        </div>
        <button className="btn-primary mt-16" onClick={handleAdd}><Plus size={18} /> Add Project</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Client</th>
              <th>Main Contractor</th>
              <th>Location</th>
              <th>Start Date</th>
              <th>Status</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-message">Loading projects...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={7} className="table-message">No projects added yet.</td></tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="font-medium">{project.project_name}</td>
                  <td>{project.client || '-'}</td>
                  <td>{project.main_contractor || '-'}</td>
                  <td>{project.location || '-'}</td>
                  <td>{project.start_date || '-'}</td>
                  <td><span className="badge severity-low">{project.status}</span></td>
                  <td><button className="btn-icon danger" onClick={() => handleDelete(project.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}