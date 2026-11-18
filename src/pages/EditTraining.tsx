// src/pages/EditTraining.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function EditTraining() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [company, setCompany] = useState('');
  const [certType, setCertType] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [existingFile, setExistingFile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCert(); }, [id]);

  const fetchCert = async () => {
    try {
      const { data, error } = await supabase.from('certifications').select('*').eq('id', id).single();
      if (error) throw error;
      setPersonName(data.person_name);
      setPersonRole(data.person_role || '');
      setPersonContact(data.person_contact || '');
      setCompany(data.company || '');
      setCertType(data.cert_type);
      setIssuingBody(data.issuing_body || '');
      setCertificateNo(data.certificate_no || '');
      setIssueDate(data.issue_date || '');
      setExpiryDate(data.expiry_date || '');
      setNotes(data.notes || '');
      setExistingFile(data.file_url || '');
    } catch (error: any) {
      alert("Error loading: " + error.message);
      navigate('/training');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!personName || !certType) { alert("Required fields missing."); return; }
    if (personContact && personContact.length !== 10) { alert("Contact must be 10 digits."); return; }

    try {
      let fileUrl = existingFile;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `cert-update-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('certifications')
        .update({
          person_name: personName, person_role: personRole, person_contact: personContact,
          company, cert_type: certType, issuing_body: issuingBody, certificate_no: certificateNo,
          issue_date: issueDate || null, expiry_date: expiryDate || null,
          file_url: fileUrl, notes
        })
        .eq('id', id);

      if (error) throw error;
      alert("Certification updated!");
      navigate('/training');
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/training" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Edit Certification</h1><p className="page-subtitle">Update dates and upload new certificates.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Person Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Full Name *</label><input type="text" className="form-input" value={personName} onChange={(e) => setPersonName(e.target.value)} /></div>
          <div className="form-group"><label>Role / Position</label><input type="text" className="form-input" value={personRole} onChange={(e) => setPersonRole(e.target.value)} /></div>
          <div className="form-group"><label>Contact Number</label><input type="tel" className="form-input" value={personContact} onChange={(e) => setPersonContact(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
          <div className="form-group"><label>Company</label><input type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Certification Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Certification Type *</label><select className="form-input" value={certType} onChange={(e) => setCertType(e.target.value)}><option value="Working at Height">Working at Height</option><option value="First Aid">First Aid</option><option value="Scaffolding">Scaffolding</option></select></div>
          <div className="form-group"><label>Issuing Body</label><input type="text" className="form-input" value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} /></div>
          <div className="form-group"><label>Certificate Number</label><input type="text" className="form-input" value={certificateNo} onChange={(e) => setCertificateNo(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">3. Validity</h3>
        <div className="form-grid">
          <div className="form-group"><label>Issue Date</label><input type="date" className="form-input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} /></div>
          <div className="form-group"><label>Expiry Date</label><input type="date" className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">4. Evidence</h3>
        {existingFile && <div className="mb-12"><a href={existingFile} target="_blank" rel="noreferrer" className="evidence-link">View Current Certificate</a></div>}
        <div className="upload-container">
          <input type="file" id="cert-update-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="cert-update-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload New Certificate (Replaces Old)"}</span>
          </label>
        </div>
        <div className="form-group mt-16"><label>Notes</label><textarea className="form-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/training" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleUpdate}>Update Certification</button>
      </div>
    </div>
  );
}