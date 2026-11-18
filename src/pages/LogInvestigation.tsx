// src/pages/LogInvestigation.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogInvestigation() {
  const { id } = useParams(); // Incident ID
  const navigate = useNavigate();

  const [methodUsed, setMethodUsed] = useState('5 Whys');
  const [investigatorName, setInvestigatorName] = useState('');
  const [investigatorRole, setInvestigatorRole] = useState('');
  const [investigationDate, setInvestigationDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Reordered Fields
  const [immediateCause, setImmediateCause] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [contributingFactors, setContributingFactors] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [findingsSummary, setFindingsSummary] = useState('');
  
  const [status, setStatus] = useState('Open');
  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestigation = async () => {
      const { data } = await supabase.from('investigations').select('*').eq('incident_id', id).maybeSingle();
      if (data) {
        setMethodUsed(data.method_used);
        setInvestigatorName(data.investigator_name);
        setInvestigatorRole(data.investigator_role || '');
        setInvestigationDate(data.investigation_date);
        setImmediateCause(data.immediate_cause || '');
        setRootCause(data.root_cause || '');
        setContributingFactors(data.contributing_factors || '');
        setCorrectiveActions(data.corrective_actions || '');
        setFindingsSummary(data.findings_summary || '');
        setStatus(data.status);
        setExistingFile(data.report_url || '');
      }
      setLoading(false);
    };
    fetchInvestigation();
  }, [id]);

  const handleSave = async () => {
    if (!investigatorName || !rootCause) {
      alert("Please fill in Investigator Name and Root Cause.");
      return;
    }

    try {
      let reportUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `inv-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        reportUrl = urlData.publicUrl;
      }

      const { data: existing } = await supabase.from('investigations').select('id').eq('incident_id', id).maybeSingle();

      const payload = {
        incident_id: id, method_used: methodUsed, investigator_name: investigatorName,
        investigator_role: investigatorRole, investigation_date: investigationDate,
        immediate_cause: immediateCause, root_cause: rootCause,
        contributing_factors: contributingFactors, corrective_actions: correctiveActions,
        findings_summary: findingsSummary, report_url: reportUrl, status
      };

      if (existing) {
        const { error } = await supabase.from('investigations').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('investigations').insert([payload]);
        if (error) throw error;
      }

      alert("Investigation saved successfully!");
      navigate(`/incidents/${id}`);
    } catch (error: any) {
      alert("Error saving investigation: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to={`/incidents/${id}`} className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Incident Investigation</h1><p className="page-subtitle">Record the root cause and corrective actions.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Investigation Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Method Used</label>
            <select className="form-input" value={methodUsed} onChange={(e) => setMethodUsed(e.target.value)}>
              <option value="5 Whys">5 Whys</option><option value="Fishbone (Ishikawa)">Fishbone (Ishikawa)</option>
              <option value="ICAM">ICAM</option><option value="TapRooT">TapRooT</option><option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group"><label>Investigator Name *</label><input type="text" className="form-input" value={investigatorName} onChange={(e) => setInvestigatorName(e.target.value)} /></div>
          <div className="form-group"><label>Investigator Role</label><input type="text" className="form-input" value={investigatorRole} onChange={(e) => setInvestigatorRole(e.target.value)} /></div>
          <div className="form-group"><label>Investigation Date</label><input type="date" className="form-input" value={investigationDate} onChange={(e) => setInvestigationDate(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Causes</h3>
        <div className="form-group mb-16"><label>Immediate Cause</label><textarea className="form-input" rows={2} value={immediateCause} onChange={(e) => setImmediateCause(e.target.value)}></textarea></div>
        <div className="form-group mb-16"><label>Root Cause *</label><textarea className="form-input" rows={3} value={rootCause} onChange={(e) => setRootCause(e.target.value)}></textarea></div>
        <div className="form-group mb-16"><label>Contributing Factors</label><textarea className="form-input" rows={2} value={contributingFactors} onChange={(e) => setContributingFactors(e.target.value)}></textarea></div>

        <h3 className="form-section-title mt-32">3. Actions & Summary</h3>
        <div className="form-group mb-16"><label>Corrective Actions</label><textarea className="form-input" rows={3} value={correctiveActions} onChange={(e) => setCorrectiveActions(e.target.value)}></textarea></div>
        <div className="form-group mb-16"><label>Findings Summary</label><textarea className="form-input" rows={2} value={findingsSummary} onChange={(e) => setFindingsSummary(e.target.value)}></textarea></div>

        <h3 className="form-section-title mt-32">4. Status & Evidence</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Open">Open</option><option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        
        {existingFile && <div className="mb-12 mt-16"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Report</a></div>}
        <div className="upload-container">
          <input type="file" id="inv-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="inv-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Investigation Report"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to={`/incidents/${id}`} className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Investigation</button>
      </div>
    </div>
  );
}