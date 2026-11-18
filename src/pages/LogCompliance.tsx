// src/pages/LogCompliance.tsx
import { useState } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css'; // For sticky bar and upload styles

export default function LogCompliance() {
  const [obligationName, setObligationName] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [authority, setAuthority] = useState('');
  const [authorityContact, setAuthorityContact] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  const [project, setProject] = useState('');
  const [site, setSite] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [renewalLeadDays, setRenewalLeadDays] = useState('60');
  
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [responsiblePersonRole, setResponsiblePersonRole] = useState('');
  const [responsiblePersonContact, setResponsiblePersonContact] = useState('');

  const handleSave = async () => {
    if (!obligationName || !type || !category) {
      alert("Please fill in required fields: Name, Type, and Category.");
      return;
    }

    if (authorityContact && authorityContact.length !== 10) {
      alert("Authority contact number must be exactly 10 digits.");
      return;
    }

    if (responsiblePersonContact && responsiblePersonContact.length !== 10) {
      alert("Responsible person contact number must be exactly 10 digits.");
      return;
    }

    try {
      // 1. Upload File if exists
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `compliance-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      // 2. Save Record
      const { error } = await supabase
        .from('compliance_register')
        .insert([{
          obligation_name: obligationName,
          type, category, authority, authority_contact: authorityContact,
          reference_number: referenceNumber,


          project, site, responsible_person: responsiblePerson,
          responsible_person_role: responsiblePersonRole,
          responsible_person_contact: responsiblePersonContact,

          



          issue_date: issueDate || null,
          expiry_date: expiryDate || null,
          renewal_lead_days: parseInt(renewalLeadDays) || 60,
          file_url: fileUrl,
          notes
        }]);

      if (error) throw error;

      alert("Compliance record saved successfully!");
      window.location.href = '/compliance';

    } catch (error: any) {
      alert("Error saving record: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/compliance" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>Add Compliance Record</h1>
            <p className="page-subtitle">Track statutory certificates, licenses, and permits.</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Core Details</h3>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Obligation Name *</label>
            <input type="text" className="form-input" placeholder="e.g., Fire Certificate - Site A" value={obligationName} onChange={(e) => setObligationName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Type *</label>
            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select Type...</option>
              <option value="Certificate">Certificate</option>
              <option value="License">License</option>
              <option value="Permit">Permit</option>
              <option value="Registration">Registration</option>
              <option value="Statutory Inspection">Statutory Inspection</option>
              <option value="Insurance">Insurance</option>
              <option value="Standard / Code">Standard / Code</option>
              <option value="Regulation / Act">Regulation / Act</option>
              <option value="Contractual Requirement">Contractual Requirement</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category...</option>
              <option value="Statutory">Statutory</option>
              <option value="Regulatory">Regulatory</option>
              <option value="Contractual">Contractual</option>
              <option value="Internal">Internal</option>
            </select>
          </div>
          <div className="form-group">
            <label>Authority / Regulator</label>
            <input type="text" className="form-input" placeholder="e.g., Ghana National Fire Service" value={authority} onChange={(e) => setAuthority(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Authority Contact</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="10-digit Contact" 
              value={authorityContact} 
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                if (numericValue.length <= 10) setAuthorityContact(numericValue);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Reference Number</label>
            <input type="text" className="form-input" placeholder="e.g., FC-2025-0412" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">2. Location & Ownership</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Project</label>
            <input type="text" className="form-input" placeholder="e.g., Riverside Tower" value={project} onChange={(e) => setProject(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Site</label>
            <input type="text" className="form-input" placeholder="e.g., Podium Zone" value={site} onChange={(e) => setSite(e.target.value)} />
          </div>


                    <div className="form-group">
            <label>Responsible Person Name</label>
            <input type="text" className="form-input" placeholder="Who owns the renewal?" value={responsiblePerson} onChange={(e) => setResponsiblePerson(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Responsible Person Role</label>
            <input type="text" className="form-input" placeholder="e.g., Site Manager" value={responsiblePersonRole} onChange={(e) => setResponsiblePersonRole(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Responsible Person Contact</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="10-digit Contact" 
              value={responsiblePersonContact} 
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                if (numericValue.length <= 10) setResponsiblePersonContact(numericValue);
              }} 
            />
          </div>

          

        </div>

        <h3 className="form-section-title mt-32">3. Validity & Tracking</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Issue Date</label>
            <input type="date" className="form-input" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input type="date" className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Renewal Lead Time (Days)</label>
            <input type="number" className="form-input" placeholder="e.g., 60" value={renewalLeadDays} onChange={(e) => setRenewalLeadDays(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">4. Document & Notes</h3>
        <div className="upload-container">
          <input type="file" id="compliance-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="compliance-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Certificate / License (PDF or Image)"}</span>
          </label>
        </div>

        <div className="form-group mt-16">
          <label>Notes</label>
          <textarea className="form-input" rows={3} placeholder="e.g., Renewal requires an inspection" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/compliance" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Record</button>
      </div>
    </div>
  );
}