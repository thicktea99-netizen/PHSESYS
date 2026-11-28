// src/pages/EditCapa.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function EditCapa() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [actionType, setActionType] = useState('Corrective');
  const [priority, setPriority] = useState('Medium');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('open');
  const [projectId, setProjectId] = useState('');
  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectsList, setProjectsList] = useState<{ id: string, project_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAction();
    fetchProjects();
  }, [id]);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, project_name').eq('status', 'active');
    if (data) setProjectsList(data);
  };

  const fetchAction = async () => {
    try {
      const { data, error } = await supabase.from('capa_actions').select('*').eq('id', id).single();
      if (error) throw error;
      setTitle(data.action_title);
      setDescription(data.description || '');
      setSourceType(data.source_type);
      setSourceRef(data.source_reference || '');
      setActionType(data.action_type);
      setPriority(data.priority);
      setOwner(data.owner);
      setDueDate(data.due_date);
      setStatus(data.status);
      setProjectId(data.project_id || '');
      setExistingFile(data.evidence_url || '');
    } catch (error: any) {
      alert("Error loading action: " + error.message);
      navigate('/capa');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !owner || !dueDate) {
      alert("Please fill in required fields: Title, Owner, and Due Date.");
      return;
    }

    try {
      let evidenceUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `capa-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        evidenceUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('capa_actions')
        .update({
          action_title: title, description, source_type: sourceType,
          source_reference: sourceRef, action_type: actionType,
          priority, owner, due_date: dueDate, status, project_id: projectId || null,
          evidence_url: evidenceUrl
        })
        .eq('id', id);

      if (error) throw error;
      alert("CAPA action updated successfully!");
      navigate('/capa');
    } catch (error: any) {
      alert("Error updating action: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/capa" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Edit CAPA Action</h1><p className="page-subtitle">Update action details, owner, and status.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Action Details</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Action Title *</label><input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="form-group span-2"><label>Description</label><textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}></textarea></div>
        </div>

        <h3 className="form-section-title mt-32">2. Source & Priority</h3>
        <div className="form-grid">
          <div className="form-group"><label>Source Type</label><select className="form-input" value={sourceType} onChange={(e) => setSourceType(e.target.value)}><option value="Inspection Finding">Inspection Finding</option><option value="Hazard / Observation">Hazard / Observation</option><option value="Incident Investigation">Incident Investigation</option><option value="Permit Condition">Permit Condition</option><option value="PPE Check">PPE Check</option><option value="Legal / Compliance">Legal / Compliance</option><option value="Other">Other</option></select></div>
          <div className="form-group"><label>Source Reference</label><input type="text" className="form-input" value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} /></div>
          <div className="form-group"><label>Action Type</label><select className="form-input" value={actionType} onChange={(e) => setActionType(e.target.value)}><option value="Corrective">Corrective</option><option value="Preventive">Preventive</option></select></div>
          <div className="form-group"><label>Priority</label><select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option></select></div>
        </div>

        <h3 className="form-section-title mt-32">3. Assignment & Status</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Project</label>
            <select className="form-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select Project...</option>
              {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Owner *</label><input type="text" className="form-input" value={owner} onChange={(e) => setOwner(e.target.value)} /></div>
          <div className="form-group"><label>Due Date *</label><input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          <div className="form-group"><label>Status</label><select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="open">Open</option><option value="in progress">In Progress</option><option value="closed">Closed</option></select></div>
        </div>

        <h3 className="form-section-title mt-32">4. Evidence</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Evidence</a></div>}
        <div className="upload-container">
          <input type="file" id="capa-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="capa-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload New Evidence"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/capa" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Update Action</button>
      </div>
    </div>
  );
}