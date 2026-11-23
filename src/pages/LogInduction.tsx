// src/pages/LogInduction.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogInduction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [personName, setPersonName] = useState('');
  const [company, setCompany] = useState('');
  const [site, setSite] = useState('');
  const [inductionDate, setInductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inductedBy, setInductedBy] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [signedAcknowledgment, setSignedAcknowledgment] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState('');
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (data) setSitesList(data);
    };
    fetchSites();
    if (id) fetchInduction();
  }, [id]);

  const fetchInduction = async () => {
    try {
      const { data, error } = await supabase.from('inductions').select('*').eq('id', id).single();
      if (error) throw error;
      setPersonName(data.person_name);
      setCompany(data.company || '');
      setSite(data.site);
      setInductionDate(data.induction_date);
      setInductedBy(data.inducted_by || '');
      setTopicsCovered(data.topics_covered || '');
      setSignedAcknowledgment(data.signed_acknowledgment || false);
      setExistingFile(data.evidence_url || '');
    } catch (error: any) {
      alert("Error loading induction: " + error.message);
      navigate('/inductions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!personName || !site || !inductionDate) {
      alert("Please fill in required fields: Person Name, Site, and Date.");
      return;
    }

    try {
      let evidenceUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `induction-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        evidenceUrl = urlData.publicUrl;
      }

      const payload = {
        person_name: personName, company, site, induction_date: inductionDate,
        inducted_by: inductedBy, topics_covered: topicsCovered,
        signed_acknowledgment: signedAcknowledgment, evidence_url: evidenceUrl
      };

      if (!id) {
        const { error } = await supabase.from('inductions').insert([payload]);
        if (error) throw error;
        await supabase.from('audit_logs').insert([{ module: 'Inductions', action: 'Logged Induction', reference: personName }]);
      } else {
        const { error } = await supabase.from('inductions').update(payload).eq('id', id);
        if (error) throw error;
      }

      alert("Induction saved successfully!");
      navigate('/inductions');
    } catch (error: any) {
      alert("Error saving induction: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/inductions" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>{id ? 'Edit Induction' : 'Log Induction'}</h1><p className="page-subtitle">Record a site induction for a worker.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Person Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Person Name *</label><input type="text" className="form-input" value={personName} onChange={(e) => setPersonName(e.target.value)} /></div>
          <div className="form-group"><label>Company</label><input type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          <div className="form-group"><label>Site *</label><select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}><option value="">Select Site...</option>{sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
          <div className="form-group"><label>Induction Date *</label><input type="date" className="form-input" value={inductionDate} onChange={(e) => setInductionDate(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Induction Details</h3>
        <div className="form-group mb-16"><label>Inducted By</label><input type="text" className="form-input" value={inductedBy} onChange={(e) => setInductedBy(e.target.value)} /></div>
        <div className="form-group mb-16"><label>Topics Covered</label><textarea className="form-input" rows={3} value={topicsCovered} onChange={(e) => setTopicsCovered(e.target.value)}></textarea></div>
        <div className="checkbox-group"><input type="checkbox" id="signed" checked={signedAcknowledgment} onChange={(e) => setSignedAcknowledgment(e.target.checked)} /><label htmlFor="signed">Signed Acknowledgment Received</label></div>

        <h3 className="form-section-title mt-32">3. Evidence</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Evidence</a></div>}
        <div className="upload-container">
          <input type="file" id="induction-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="induction-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Signed Induction Form"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/inductions" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Induction</button>
      </div>
    </div>
  );
}