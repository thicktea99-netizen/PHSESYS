// src/pages/LogCapa.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogCapa() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [actionType, setActionType] = useState('Corrective');
  const [priority, setPriority] = useState('Medium');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectsList, setProjectsList] = useState<{ id: string, project_name: string }[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('id, project_name').eq('status', 'active');
      if (data) setProjectsList(data);
    };
    fetchProjects();
  }, []);

  const handleSave = async () => {
    if (!title || !sourceType || !owner || !dueDate) {
      alert("Please fill in required fields: Action Title, Source, Owner, and Due Date.");
      return;
    }

    try {
      const { error } = await supabase
        .from('capa_actions')
        .insert([{
          action_title: title,
          description: description,
          source_type: sourceType,
          source_reference: sourceRef,
          action_type: actionType,
          priority: priority,
          owner: owner,
          due_date: dueDate,
          project_id: projectId || null,
          status: 'open'
        }]);

      if (error) throw error;

      await supabase.from('audit_logs').insert([{
        module: 'CAPA',
        action: 'Raised CAPA Action',
        reference: title
      }]);

      alert("CAPA Action raised successfully!");
      window.location.href = '/capa';

    } catch (error: any) {
      alert("Error saving action: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/capa" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Raise CAPA Action</h1><p className="page-subtitle">Assign a corrective or preventive action.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Action Details</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Action Title *</label><input type="text" className="form-input" placeholder="e.g., Introduce pre-lift sling verification" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="form-group span-2"><label>Description</label><textarea className="form-input" rows={3} placeholder="Describe the action to be taken..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea></div>
        </div>

        <h3 className="form-section-title mt-32">2. Source & Priority</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Source Type *</label>
            <select className="form-input" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              <option value="">Select Source...</option>
              <option value="Inspection Finding">Inspection Finding</option>
              <option value="Hazard / Observation">Hazard / Observation</option>
              <option value="Incident Investigation">Incident Investigation</option>
              <option value="Permit Condition">Permit Condition</option>
              <option value="PPE Check">PPE Check</option>
              <option value="Legal / Compliance">Legal / Compliance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group"><label>Source Reference (Optional)</label><input type="text" className="form-input" placeholder="e.g., INC-0001" value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} /></div>
          <div className="form-group"><label>Action Type *</label><select className="form-input" value={actionType} onChange={(e) => setActionType(e.target.value)}><option value="Corrective">Corrective (Fix the immediate problem)</option><option value="Preventive">Preventive (Stop it happening again)</option></select></div>
          <div className="form-group"><label>Priority *</label><select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option></select></div>
        </div>

        <h3 className="form-section-title mt-32">3. Assignment</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Project</label>
            <select className="form-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select Project...</option>
              {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Action Owner *</label><input type="text" className="form-input" placeholder="e.g., ABC Scaffolding Supervisor" value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
          <div className="form-group"><label>Due Date *</label><input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/capa" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Action</button>
      </div>
    </div>
  );
}