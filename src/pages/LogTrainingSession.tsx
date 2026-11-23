// src/pages/LogTrainingSession.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogTrainingSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [site, setSite] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [trainerContact, setTrainerContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState('');
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  const [trainingTypes, setTrainingTypes] = useState<{ id: string, option_value: string }[]>([]);

  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (data) setSitesList(data);
    };
    fetchSites();
    if (id) fetchSession();
  }, [id]);

    useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: typeData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'training_type').order('option_value');
      if (typeData) setTrainingTypes(typeData);
    };
    fetchData();
    if (id) fetchSession();
  }, [id]);



  const fetchSession = async () => {
    try {
      const { data, error } = await supabase.from('training_sessions').select('*').eq('id', id).single();
      if (error) throw error;
      setTitle(data.title);
      setTrainingType(data.training_type || '');
      setSite(data.site || '');
      setTrainerName(data.trainer_name || '');
      setTrainerContact(data.trainer_contact || '');
      setDate(data.date);
      setDurationHours(data.duration_hours?.toString() || '');
      setAttendeeCount(data.attendee_count?.toString() || '');
      setTopicsCovered(data.topics_covered || '');
      setCertificateIssued(data.certificate_issued || false);
      setExistingFile(data.evidence_url || '');
    } catch (error: any) {
      alert("Error loading session: " + error.message);
      navigate('/training-sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !date) {
      alert("Please fill in required fields: Title and Date.");
      return;
    }
    if (trainerContact && trainerContact.length !== 10) {
      alert("Trainer contact must be exactly 10 digits.");
      return;
    }

    try {
      let evidenceUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `training-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        evidenceUrl = urlData.publicUrl;
      }

      const payload = {
        title, training_type: trainingType, site,
        trainer_name: trainerName, trainer_contact: trainerContact,
        date, duration_hours: durationHours ? parseFloat(durationHours) : null,
        attendee_count: attendeeCount ? parseInt(attendeeCount) : 0,
        topics_covered: topicsCovered, certificate_issued: certificateIssued,
        evidence_url: evidenceUrl
      };

      if (!id) {
        const { error } = await supabase.from('training_sessions').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('training_sessions').update(payload).eq('id', id);
        if (error) throw error;
      }

      alert("Training session saved successfully!");
      navigate('/training-sessions');
    } catch (error: any) {
      alert("Error saving session: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/training-sessions" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>{id ? 'Edit Training Session' : 'Log Training Session'}</h1><p className="page-subtitle">Record a formal training event.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Session Details</h3>
        <div className="form-grid">
          <div className="form-group span-2"><label>Title *</label><input type="text" className="form-input" placeholder="e.g., First Aid Training" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Training Type</label>
            <select className="form-input" value={trainingType} onChange={(e) => setTrainingType(e.target.value)}
            >
              <option value="">Select Type...</option>
              {trainingTypes.map((type) => (
                <option key={type.id} value={type.option_value}>{type.option_value}</option>
              ))}
            </select>
          </div>


          <div className="form-group"><label>Site</label><select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}><option value="">Select Site...</option>{sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
          <div className="form-group"><label>Date *</label><input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="form-group"><label>Duration (hours)</label><input type="number" className="form-input" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Trainer & Attendees</h3>
        <div className="form-grid">
          <div className="form-group"><label>Trainer Name</label><input type="text" className="form-input" value={trainerName} onChange={(e) => setTrainerName(e.target.value)} /></div>
          <div className="form-group"><label>Trainer Contact</label><input type="tel" className="form-input" placeholder="10-digit Contact" value={trainerContact} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setTrainerContact(val); }} /></div>
          <div className="form-group"><label>Number of Attendees</label><input type="number" className="form-input" value={attendeeCount} onChange={(e) => setAttendeeCount(e.target.value)} /></div>
          <div className="form-group" style={{ justifyContent: 'center' }}><label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}><input type="checkbox" checked={certificateIssued} onChange={(e) => setCertificateIssued(e.target.checked)} /> Certificate Issued</label></div>
        </div>

        <div className="form-group mt-16"><label>Topics Covered</label><textarea className="form-input" rows={3} value={topicsCovered} onChange={(e) => setTopicsCovered(e.target.value)}></textarea></div>

        <h3 className="form-section-title mt-32">3. Evidence</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Evidence</a></div>}
        <div className="upload-container">
          <input type="file" id="training-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="training-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Attendance Sheet / Photos"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/training-sessions" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Session</button>
      </div>
    </div>
  );
}