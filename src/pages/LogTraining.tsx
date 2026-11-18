// src/pages/LogTraining.tsx
import { useState } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogTraining() {
  // --- PERSON DETAILS ---
  const [personName, setPersonName] = useState('');
  const [personRole, setPersonRole] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [company, setCompany] = useState('');

  // --- CERTIFICATION DETAILS ---
  const [certType, setCertType] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // --- EVIDENCE ---
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = async () => {
    if (!personName || !certType) {
      alert("Please fill in required fields: Person Name and Certification Type.");
      return;
    }

    if (personContact && personContact.length !== 10) {
      alert("Person contact number must be exactly 10 digits.");
      return;
    }

    try {
      // 1. Upload File if exists
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `cert-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      // 2. Save Record
      const { error } = await supabase
        .from('certifications')
        .insert([{
          person_name: personName,
          person_role: personRole,
          person_contact: personContact,
          company: company,
          cert_type: certType,
          issuing_body: issuingBody,
          certificate_no: certificateNo,
          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
          file_url: fileUrl,
          notes: notes
        }]);

      if (error) throw error;

      alert("Certification saved successfully!");
      window.location.href = '/training';

    } catch (error: any) {
      alert("Error saving certification: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/training" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>Add Certification</h1>
            <p className="page-subtitle">Log a worker's training or certification.</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Person Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" className="form-input" placeholder="e.g., John Mensah" value={personName} onChange={(e) => setPersonName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Role / Position</label>
            <input type="text" className="form-input" placeholder="e.g., Scaffolder" value={personRole} onChange={(e) => setPersonRole(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="10-digit Contact" 
              value={personContact} 
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                if (numericValue.length <= 10) setPersonContact(numericValue);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Company / Contractor</label>
            <input type="text" className="form-input" placeholder="e.g., ABC Scaffolding" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">2. Certification Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Certification Type *</label>
            <select className="form-input" value={certType} onChange={(e) => setCertType(e.target.value)}>
              <option value="">Select Type...</option>
              <option value="Working at Height">Working at Height</option>
              <option value="Scaffolding">Scaffolding</option>
              <option value="Confined Space Entry">Confined Space Entry</option>
              <option value="First Aid">First Aid</option>
              <option value="Fire Warden">Fire Warden</option>
              <option value="Rigging / Slinging">Rigging / Slinging</option>
              <option value="Banksman / Signaller">Banksman / Signaller</option>
              <option value="Plant Operation">Plant Operation</option>
              <option value="Electrical Safety">Electrical Safety</option>
              <option value="HAZWOPER">HAZWOPER</option>
            </select>
          </div>
          <div className="form-group">
            <label>Issuing Body</label>
            <input type="text" className="form-input" placeholder="e.g., Ghana Safety Institute" value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Certificate Number</label>
            <input type="text" className="form-input" placeholder="e.g., WAH-2025-0412" value={certificateNo} onChange={(e) => setCertificateNo(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">3. Validity</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Issue Date</label>
            <input type="date" className="form-input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input type="date" className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">4. Evidence & Notes</h3>
        <div className="upload-container">
          <input type="file" id="cert-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="cert-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Certificate (PDF or Image)"}</span>
          </label>
        </div>

        <div className="form-group mt-16">
          <label>Notes</label>
          <textarea className="form-input" rows={3} placeholder="e.g., Original seen, copy on file" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/training" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Certification</button>
      </div>
    </div>
  );
}