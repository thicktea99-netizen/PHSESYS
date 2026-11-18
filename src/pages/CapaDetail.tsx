

// src/pages/CapaDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/CapaDetail.css';

export default function CapaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [action, setAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAction();
  }, [id]);

  const fetchAction = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('capa_actions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setAction(data);
      setStatus(data.status);
      setProgressNotes(data.description || '');
    } catch (error: any) {
      alert("Error fetching action: " + error.message);
      navigate('/capa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      let evidenceUrl = action.evidence_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `capa-${id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('inspection-photos')
          .getPublicUrl(fileName);
          
        evidenceUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('capa_actions')
        .update({ 
          status: status,
          description: progressNotes,
          evidence_url: evidenceUrl
        })
        .eq('id', id);

      if (error) throw error;
      
      alert("Action updated successfully!");
      navigate('/capa');
    } catch (error: any) {
      alert("Error updating: " + error.message);
    }
  };

  if (loading) return <div className="loading-state">Loading action details...</div>;
  if (!action) return <div className="loading-state">Action not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/capa" className="back-link">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1>CAPA-{String(action.capa_number).padStart(4, '0')}</h1>
            <p className="page-subtitle">{action.action_title}</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Source</label>
            <input type="text" className="form-input" value={`${action.source_type} (${action.source_reference || 'N/A'})`} disabled />
          </div>
          <div className="form-group">
            <label>Owner</label>
            <input type="text" className="form-input" value={action.owner} disabled />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="text" className="form-input" value={action.due_date} disabled />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <input type="text" className="form-input" value={action.priority} disabled />
          </div>
        </div>

        <h3 className="form-section-title mt-32">Update Progress</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Status *</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="form-group mt-16">
          <label>Progress Notes</label>
          <textarea 
            className="form-input" 
            rows={4} 
            placeholder="Add notes on what has been done..."
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group mt-16">
          <label>Evidence (Photo / Document)</label>
          {action.evidence_url && (
            <div className="mb-12">
              <a href={action.evidence_url} target="_blank" rel="noreferrer" className="evidence-link">
                View Current Evidence
              </a>
            </div>
          )}
          <input 
            type="file" 
            className="form-input" 
            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary" onClick={handleUpdateStatus}>
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}