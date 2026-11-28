// src/pages/LogHazard.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogHazard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [observerName, setObserverName] = useState('');
  const [observerRole, setObserverRole] = useState('');
  const [entryType, setEntryType] = useState('');
  const [projectId, setProjectId] = useState('');
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [requiresCapa, setRequiresCapa] = useState(false);
  const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);

  const [likelihood, setLikelihood] = useState(3);
  const [consequence, setConsequence] = useState(3);
  const riskScore = likelihood * consequence;

  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [sitesList, setSitesList] = useState<{ id: string, name: string, project_id: string }[]>([]);
  const [projectsList, setProjectsList] = useState<{ id: string, project_name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name, project_id').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: projectsData } = await supabase.from('projects').select('id, project_name').eq('status', 'active');
      if (projectsData) setProjectsList(projectsData);
    };
    fetchData();
    if (id) fetchHazard();
  }, [id]);

  // Auto-fill project when site is selected
  useEffect(() => {
    if (site) {
      const selectedSite = sitesList.find(s => s.name === site);
      if (selectedSite && selectedSite.project_id) {
        setProjectId(selectedSite.project_id);
      }
    }
  }, [site, sitesList]);

  const fetchHazard = async () => {
    try {
      const { data, error } = await supabase.from('hazards').select('*').eq('id', id).single();
      if (error) throw error;
      
      setObserverName(data.observer_name || '');
      setObserverRole(data.observer_role || '');
      setEntryType(data.entry_type || '');
      setProjectId(data.project_id || '');
      setSite(data.project_site || '');
      setArea(data.area || '');
      setDescription(data.description || '');
      setImmediateAction(data.immediate_action || '');
      setRequiresCapa(data.requires_capa || false);
      setDateObserved(data.date_observed || '');
      setLikelihood(data.likelihood || 3);
      setConsequence(data.consequence || 3);
      setExistingFile(data.photo_url || '');
    } catch (error: any) {
      alert("Error loading hazard: " + error.message);
      navigate('/hazards');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 4) return 'severity-low';
    if (score <= 9) return 'severity-medium';
    if (score <= 15) return 'severity-high';
    return 'severity-critical';
  };

  const handleSave = async () => {
    if (!observerName || !entryType || !site || !description) {
      alert("Please fill in required fields: Observer Name, Type, Site, and Description.");
      return;
    }

    try {
      let photoUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `hazard-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const payload = {
        observer_name: observerName, observer_role: observerRole,
        entry_type: entryType, project_id: projectId || null, project_site: site, area: area, description: description,
        likelihood: entryType === 'Positive Observation' ? null : likelihood,
        consequence: entryType === 'Positive Observation' ? null : consequence,
        risk_score: entryType === 'Positive Observation' ? null : riskScore,
        immediate_action: immediateAction, requires_capa: requiresCapa,
        date_observed: dateObserved, photo_url: photoUrl
      };

      let hazardId = id;
      if (!hazardId) {
        const { data, error } = await supabase.from('hazards').insert([payload]).select().single();
        if (error) throw error;
        hazardId = data.id;

        await supabase.from('audit_logs').insert([{
          module: 'Hazards',
          action: 'Logged Hazard',
          reference: `HAZ-${String(data.hazard_number).padStart(4, '0')}`
        }]);

        if (requiresCapa) {
          await supabase.from('capa_actions').insert([{
            action_title: `Hazard: ${entryType}`, description: description,
            source_type: 'Hazard / Observation',
            source_reference: `HAZ-${String(data.hazard_number).padStart(4, '0')}`,
            action_type: 'Corrective', priority: riskScore >= 16 ? 'Critical' : riskScore >= 10 ? 'High' : riskScore >= 5 ? 'Medium' : 'Low',
            owner: 'Unassigned', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'open'
          }]);
        }
      } else {
        const { error } = await supabase.from('hazards').update(payload).eq('id', hazardId);
        if (error) throw error;

        await supabase.from('audit_logs').insert([{
          module: 'Hazards',
          action: 'Updated Hazard',
          reference: `HAZ-${String(hazardId).slice(0, 8)}`
        }]);
      }

      alert("Hazard saved successfully!");
      navigate('/hazards');
    } catch (error: any) {
      alert("Error saving hazard: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/hazards" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>{id ? 'Edit Hazard' : 'Log Hazard / Observation'}</h1><p className="page-subtitle">Record a hazard, unsafe act, or positive observation.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Observer Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Observer Name *</label><input type="text" className="form-input" value={observerName} onChange={(e) => setObserverName(e.target.value)} /></div>
          <div className="form-group"><label>Observer Role / Company</label><input type="text" className="form-input" value={observerRole} onChange={(e) => setObserverRole(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Observation Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Entry Type *</label>
            <select className="form-input" value={entryType} onChange={(e) => setEntryType(e.target.value)}>
              <option value="">Select Type...</option>
              <option value="Hazard">Hazard</option><option value="Unsafe Act">Unsafe Act</option>
              <option value="Unsafe Condition">Unsafe Condition</option><option value="Positive Observation">Positive Observation</option>
            </select>
          </div>
          <div className="form-group"><label>Date Observed *</label><input type="date" className="form-input" value={dateObserved} onChange={(e) => setDateObserved(e.target.value)} /></div>
          <div className="form-group">
            <label>Project</label>
            <select className="form-input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select Project...</option>
              {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Area / Location Detail</label><input type="text" className="form-input" value={area} onChange={(e) => setArea(e.target.value)} /></div>
        </div>

        <div className="form-group mt-16">
          <label>Description *</label>
          <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        </div>

        {entryType && entryType !== 'Positive Observation' && (
          <>
            <h3 className="form-section-title mt-32">3. Risk Assessment</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Likelihood (1-5)</label>
                <select className="form-input" value={likelihood} onChange={(e) => setLikelihood(parseInt(e.target.value))}>
                  <option value={1}>1 - Rare</option><option value={2}>2 - Unlikely</option>
                  <option value={3}>3 - Possible</option><option value={4}>4 - Likely</option><option value={5}>5 - Almost Certain</option>
                </select>
              </div>
              <div className="form-group">
                <label>Consequence (1-5)</label>
                <select className="form-input" value={consequence} onChange={(e) => setConsequence(parseInt(e.target.value))}>
                  <option value={1}>1 - Insignificant</option><option value={2}>2 - Minor</option>
                  <option value={3}>3 - Moderate</option><option value={4}>4 - Major</option><option value={5}>5 - Catastrophic</option>
                </select>
              </div>
              <div className="form-group">
                <label>Risk Score (Auto)</label>
                <div className={`form-input ${getRiskColor(riskScore)}`} style={{ fontWeight: 600, textAlign: 'center' }}>{riskScore} / 25</div>
              </div>
            </div>
          </>
        )}

        <h3 className="form-section-title mt-32">4. Actions</h3>
        <div className="form-group">
          <label>Immediate Action Taken</label>
          <textarea className="form-input" rows={2} value={immediateAction} onChange={(e) => setImmediateAction(e.target.value)}></textarea>
        </div>

        <div className="checkbox-group mt-16">
          <input type="checkbox" id="requiresCapa" checked={requiresCapa} onChange={(e) => setRequiresCapa(e.target.checked)} />
          <label htmlFor="requiresCapa" className={requiresCapa ? 'text-danger' : ''}>Requires CAPA Action</label>
        </div>

        <h3 className="form-section-title mt-32">5. Attachments</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Photo</a></div>}
        <div className="upload-container">
          <input type="file" id="hazard-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="hazard-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload New Photo"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/hazards" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Hazard</button>
      </div>
    </div>
  );
}