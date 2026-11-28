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

  const [site, setSite] = useState('');
  const [inductionDate, setInductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inductedBy, setInductedBy] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
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
      setSite(data.site);
      setInductionDate(data.induction_date);
      setInductedBy(data.inducted_by || '');
      setAttendeeCount(data.attendee_count?.toString() || '');
      setTopicsCovered(data.topics_covered || '');
      setExistingFile(data.evidence_url || '');
    } catch (error: any) {
      alert("Error loading induction: " + error.message);
      navigate('/inductions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!site || !inductionDate || !inductedBy) {
      alert("Please fill in required fields: Site, Date, and Inducted By.");
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
        site, induction_date: inductionDate, inducted_by: inductedBy,
        attendee_count: attendeeCount ? parseInt(attendeeCount) : 0,
        topics_covered: topicsCovered, evidence_url: evidenceUrl
      };

      if (!id) {
        const { error } = await supabase.from('inductions').insert([payload]);
        if (error) throw error;
        await supabase.from('audit_logs').insert([{ module: 'Inductions', action: 'Logged Induction Session', reference: site }]);
      } else {
        const { error } = await supabase.from('inductions').update(payload).eq('id', id);
        if (error) throw error;
      }

      alert("Induction session saved successfully!");
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
          <div><h1>{id ? 'Edit Induction Session' : 'Log Induction Session'}</h1><p className="page-subtitle">Record a site induction session.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Session Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Induction Date *</label><input type="date" className="form-input" value={inductionDate} onChange={(e) => setInductionDate(e.target.value)} /></div>
          <div className="form-group"><label>Inducted By *</label><input type="text" className="form-input" value={inductedBy} onChange={(e) => setInductedBy(e.target.value)} /></div>
          <div className="form-group"><label>Number of Attendees</label><input type="number" className="form-input" value={attendeeCount} onChange={(e) => setAttendeeCount(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Topics Covered</h3>
        <div className="form-group mb-16">
          <textarea className="form-input" rows={3} value={topicsCovered} onChange={(e) => setTopicsCovered(e.target.value)}></textarea>
        </div>

        <h3 className="form-section-title mt-32">3. Evidence</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Attendance Sheet</a></div>}
        <div className="upload-container">
          <input type="file" id="induction-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="induction-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Signed Attendance Sheet"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/inductions" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Session</button>
      </div>
    </div>
  );
}