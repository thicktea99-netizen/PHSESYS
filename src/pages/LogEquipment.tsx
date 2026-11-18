// src/pages/LogEquipment.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function LogEquipment() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [site, setSite] = useState('');
  const [status, setStatus] = useState('In Service');
  
  const [assignedToName, setAssignedToName] = useState('');
  const [assignedToRole, setAssignedToRole] = useState('');
  const [assignedToContact, setAssignedToContact] = useState('');
  
  const [lastInspectionDate, setLastInspectionDate] = useState('');
  const [nextInspectionDue, setNextInspectionDue] = useState('');
  
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (data) setSitesList(data);
    };
    fetchSites();
  }, []);

  const handleSave = async () => {
    if (!name || !type) {
      alert("Please fill in required fields: Equipment Name and Type.");
      return;
    }
    if (assignedToContact && assignedToContact.length !== 10) {
      alert("Assigned person contact must be exactly 10 digits.");
      return;
    }

    try {
      let photoUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `equip-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('equipment')
        .insert([{
          name, type, serial_number: serialNumber, site, status,
          assigned_to_name: assignedToName, assigned_to_role: assignedToRole, assigned_to_contact: assignedToContact,
          last_inspection_date: lastInspectionDate || null,
          next_inspection_due: nextInspectionDue || null,
          photo_url: photoUrl, notes
        }]);

      if (error) throw error;

      alert("Equipment registered successfully!");
      window.location.href = '/equipment';

    } catch (error: any) {
      alert("Error saving equipment: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/equipment" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Register Equipment</h1><p className="page-subtitle">Add a new tool, plant, or vehicle to the register.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Equipment Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Equipment Name *</label><input type="text" className="form-input" placeholder="e.g., Makita Angle Grinder" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-group">
            <label>Equipment Type *</label>
            <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Select Type...</option>
              <option value="Power Tool">Power Tool</option>
              <option value="Hand Tool">Hand Tool</option>
              <option value="Heavy Plant">Heavy Plant</option>
              <option value="Lifting Gear">Lifting Gear</option>
              <option value="Vehicle">Vehicle</option>
            </select>
          </div>
          <div className="form-group"><label>Serial / Asset Number</label><input type="text" className="form-input" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} /></div>
          <div className="form-group">
            <label>Site</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="In Service">In Service</option>
              <option value="Damaged">Damaged</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <h3 className="form-section-title mt-32">2. Assigned To (Optional)</h3>
        <div className="form-grid">
          <div className="form-group"><label>Person Name</label><input type="text" className="form-input" value={assignedToName} onChange={(e) => setAssignedToName(e.target.value)} /></div>
          <div className="form-group"><label>Role / Company</label><input type="text" className="form-input" value={assignedToRole} onChange={(e) => setAssignedToRole(e.target.value)} /></div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" className="form-input" placeholder="10-digit Contact" value={assignedToContact} onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              if (numericValue.length <= 10) setAssignedToContact(numericValue);
            }} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">3. Inspection Dates</h3>
        <div className="form-grid">
          <div className="form-group"><label>Last Inspection Date</label><input type="date" className="form-input" value={lastInspectionDate} onChange={(e) => setLastInspectionDate(e.target.value)} /></div>
          <div className="form-group"><label>Next Inspection Due</label><input type="date" className="form-input" value={nextInspectionDue} onChange={(e) => setNextInspectionDue(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">4. Photo & Notes</h3>
        <div className="upload-container">
          <input type="file" id="equip-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="equip-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Upload Photo / Certificate"}</span>
          </label>
        </div>
        <div className="form-group mt-16"><label>Notes</label><textarea className="form-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}></textarea></div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/equipment" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Equipment</button>
      </div>
    </div>
  );
}