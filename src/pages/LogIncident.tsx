// src/pages/LogIncident.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/LogIncident.css';

interface Witness {
  id: number;
  name: string;
  contact: string;
  statement: string;
}

export default function LogIncident() {
  const [searchParams] = useSearchParams();
  const prefillEquipment = searchParams.get('equipment');
  const prefillSite = searchParams.get('site');

  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('low');
  const [reporterName, setReporterName] = useState('');
  const [reporterRole, setReporterRole] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  
  const [projectId, setProjectId] = useState('');
  const [site, setSite] = useState(prefillSite || '');
  const [area, setArea] = useState('');
  const [involvedItem, setInvolvedItem] = useState('');
  const [activity, setActivity] = useState('');
  
  const [victimName, setVictimName] = useState('');
  const [victimRole, setVictimRole] = useState('');
  const [victimContact, setVictimContact] = useState('');

  const [immediateAction, setImmediateAction] = useState('');
  const [reportedToRegulator, setReportedToRegulator] = useState('no');
  const [regulatorTime, setRegulatorTime] = useState('');
  const [regulatorRef, setRegulatorRef] = useState('');
  
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [vehicleAffiliation, setVehicleAffiliation] = useState('company');

  const [sitesList, setSitesList] = useState<{ id: string, name: string, project_id: string }[]>([]);
  const [projectsList, setProjectsList] = useState<{ id: string, project_name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name, project_id').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);

      const { data: projectsData } = await supabase.from('projects').select('id, project_name').eq('status', 'active');
      if (projectsData) setProjectsList(projectsData);
    };
    fetchData();
  }, []);

  // Auto-fill project when site is selected
  useEffect(() => {
    if (site) {
      const selectedSite = sitesList.find(s => s.name === site);
      if (selectedSite && selectedSite.project_id) {
        setProjectId(selectedSite.project_id);
      }
    }
  }, [site, sitesList]);

  const addWitness = () => {
    setWitnesses([...witnesses, { id: Date.now(), name: '', contact: '', statement: '' }]);
  };

  const removeWitness = (id: number) => {
    setWitnesses(witnesses.filter(w => w.id !== id));
  };

  const updateWitness = (id: number, field: keyof Witness, value: string) => {
    setWitnesses(witnesses.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setIncidentType(type);
    if (type === 'fatality') {
      setSeverity('catastrophic');
    }
  };

  const isSpecificDetailsVisible = incidentType && incidentType !== 'near-miss';
  const actionsSectionNumber = isSpecificDetailsVisible ? 4 : 3;
  const attachmentsSectionNumber = isSpecificDetailsVisible ? 5 : 4;

  const handleSave = async () => {
    if (!reporterName || !incidentType || !date || !time || !description) {
      alert("Please fill in required fields: Reporter, Type, Date, Time, and Description.");
      return;
    }

    if (victimContact && victimContact.length !== 10) {
      alert("Victim contact number must be exactly 10 digits.");
      return;
    }

    for (const witness of witnesses) {
      if (witness.contact && witness.contact.length !== 10) {
        alert(`Please enter a valid 10-digit phone number for witness: ${witness.name || 'Unnamed'}`);
        return;
      }
    }

    try {
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .insert([{
          incident_type: incidentType,
          date_of_occurrence: date,
          time_of_occurrence: time,
          severity: severity,
          reporter_name: reporterName,
          reporter_role: reporterRole,
          description: description,
          project_id: projectId || null,
          site: site,
          area: area,
          involved_item: involvedItem,
          activity: activity,
          victim_name: victimName || null,
          victim_role: victimRole || null,
          victim_contact: victimContact || null,
          immediate_action: immediateAction,
          reported_to_regulator: reportedToRegulator,
          regulator_notified_time: regulatorTime || null,
          regulator_ref_number: regulatorRef
        }])
        .select()
        .single();

      if (incidentError) throw incidentError;

      if (witnesses.length > 0) {
        const witnessData = witnesses.map(w => ({
          incident_id: incidentData.id,
          name: w.name,
          contact: w.contact,
          statement: w.statement
        }));
        
        const { error: witnessError } = await supabase.from('incident_witnesses').insert(witnessData);
        if (witnessError) throw witnessError;
      }

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${incidentData.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('incident-attachments').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
      }

      await supabase.from('audit_logs').insert([{
        module: 'Incidents',
        action: 'Logged Incident',
        reference: `INC-${String(incidentData.incident_number).padStart(4, '0')}`
      }]);

      alert("Incident saved successfully!");
      window.location.href = '/incidents'; 

    } catch (error: any) {
      alert("Error saving incident: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/incidents" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>Log New Incident</h1><p className="page-subtitle">Record a new incident or near-miss.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Core Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Reporter Name *</label><input type="text" className="form-input" placeholder="Who is reporting this?" value={reporterName} onChange={(e) => setReporterName(e.target.value)} /></div>
          <div className="form-group"><label>Reporter Role / Company</label><input type="text" className="form-input" placeholder="e.g., Site Supervisor - ABC Ltd" value={reporterRole} onChange={(e) => setReporterRole(e.target.value)} /></div>
          <div className="form-group">
            <label>Incident Type *</label>
            <select className="form-input" value={incidentType} onChange={handleTypeChange}>
              <option value="">Select Type...</option>
              <option value="near-miss">Near-Miss</option>
              <option value="first-aid">First Aid Case</option>
              <option value="lti">Lost Time Injury (LTI)</option>
              <option value="fatality">Fatality</option>
              <option value="vehicle">Vehicle Incident</option>
              <option value="property">Property / Equipment Damage</option>
              <option value="environmental">Environmental Incident</option>
              <option value="occupational-illness">Occupational Illness</option>
            </select>
          </div>
          <div className="form-group">
            <label>Severity *</label>
            <select className="form-input" value={severity} onChange={(e) => setSeverity(e.target.value)} disabled={incidentType === 'fatality'}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              <option value="critical">Critical</option><option value="catastrophic">Catastrophic</option>
            </select>
          </div>
          <div className="form-group"><label>Date of Occurrence *</label><input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="form-group"><label>Time of Occurrence *</label><input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        </div>

        <div className="form-group mt-16">
          <label>Description of Event *</label>
          <textarea className="form-input" rows={4} placeholder="What happened? Describe the sequence of events..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        </div>

        <h3 className="form-section-title mt-32">2. Location & People</h3>
        <div className="form-grid">
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
              {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Area / Location Detail *</label><input type="text" className="form-input" placeholder="e.g., Level 3 - Column B4" value={area} onChange={(e) => setArea(e.target.value)} /></div>
          <div className="form-group">
            <label>Equipment / Substance Involved</label>
            <select className="form-input" value={involvedItem} onChange={(e) => setInvolvedItem(e.target.value)}>
              <option value="">Select...</option>
              <option value="None">None</option>
              <option value="Hand Tools">Hand Tools</option>
              <option value="Power Tools">Power Tools</option>
              <option value="Plant / Heavy Equipment">Plant / Heavy Equipment</option>
              <option value="Hazardous Substance">Hazardous Substance</option>
              <option value="Ladder">Ladder</option>
              <option value="Scaffold">Scaffold</option>
              <option value="Vehicle">Vehicle</option>
            </select>
          </div>
          <div className="form-group"><label>Activity / Task at Time of Incident</label><input type="text" className="form-input" placeholder="e.g., Welding rebar couplers" value={activity} onChange={(e) => setActivity(e.target.value)} /></div>
        </div>

        <div className="findings-container mt-16">
          <div className="findings-header">
            <div>
              <h3>Victim Details (if applicable)</h3>
              <p>Record the name, role, and contact of the person involved.</p>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label>Victim Name</label><input type="text" className="form-input" placeholder="Full name" value={victimName} onChange={(e) => setVictimName(e.target.value)} /></div>
            <div className="form-group"><label>Victim Role / Company</label><input type="text" className="form-input" placeholder="e.g., Visitor, Client, Worker" value={victimRole} onChange={(e) => setVictimRole(e.target.value)} /></div>
            <div className="form-group">
              <label>Victim Contact</label>
              <input type="tel" className="form-input" placeholder="10-digit Contact" value={victimContact} onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                if (numericValue.length <= 10) setVictimContact(numericValue);
              }} />
            </div>
          </div>
        </div>

        <div className="witness-container">
          <div className="witness-header">
            <h4>Witnesses</h4>
            <button type="button" onClick={addWitness} className="btn-secondary btn-small"><Plus size={14} /> Add Witness</button>
          </div>
          {witnesses.length === 0 && <p className="no-witnesses">No witnesses added yet.</p>}
          {witnesses.map((witness) => (
            <div key={witness.id} className="witness-row">
              <input type="text" className="form-input" placeholder="Name" value={witness.name} onChange={(e) => updateWitness(witness.id, 'name', e.target.value)} />
              <input type="tel" className="form-input" placeholder="10-digit Contact" value={witness.contact} onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                if (numericValue.length <= 10) updateWitness(witness.id, 'contact', numericValue);
              }} />
              <input type="text" className="form-input" placeholder="Brief statement" value={witness.statement} onChange={(e) => updateWitness(witness.id, 'statement', e.target.value)} />
              <button type="button" onClick={() => removeWitness(witness.id)} className="btn-icon danger"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        {isSpecificDetailsVisible && (<h3 className="form-section-title mt-32">3. Specific Details</h3>)}

        {(incidentType === 'first-aid' || incidentType === 'lti') && (
          <div className="form-grid dynamic-section bg-red">
            <div className="form-group"><label>Injury Classification</label><select className="form-input"><option>Laceration</option><option>Sprain/Strain</option><option>Fracture</option><option>Burn</option></select></div>
            <div className="form-group"><label>Body Part Affected</label><select className="form-input"><option>Head</option><option>Neck</option><option>Back</option><option>Left Arm</option><option>Right Arm</option><option>Left Hand</option><option>Right Hand</option><option>Legs</option></select></div>
            <div className="form-group"><label>Treatment Given</label><input type="text" className="form-input" placeholder="e.g., Referred to clinic" /></div>
            <div className="form-group"><label>Lost Time Days</label><input type="number" className="form-input" placeholder="0" /></div>
          </div>
        )}

        {incidentType === 'fatality' && (
          <div className="form-grid dynamic-section bg-red">
            <div className="form-group"><label>Next of Kin Notified?</label><select className="form-input"><option>Pending</option><option>Yes</option><option>No</option></select></div>
            <div className="form-group"><label>Authority Notified</label><select className="form-input"><option>Police</option><option>Factory Inspectorate</option><option>Ambulance</option><option>Multiple</option></select></div>
            <div className="form-group span-2"><label>Cause of Death</label><input type="text" className="form-input" placeholder="e.g., Blunt force trauma" /></div>
          </div>
        )}

        {incidentType === 'vehicle' && (
          <div className="dynamic-section bg-blue">
            <div className="radio-group mb-16">
              <label className="radio-label"><input type="radio" name="vehicleAff" value="company" checked={vehicleAffiliation === 'company'} onChange={() => setVehicleAffiliation('company')} /> Company Vehicle</label>
              <label className="radio-label"><input type="radio" name="vehicleAff" value="non-company" checked={vehicleAffiliation === 'non-company'} onChange={() => setVehicleAffiliation('non-company')} /> Non-Company Vehicle</label>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>Vehicle Type</label><select className="form-input"><option>Car</option><option>Pickup</option><option>Truck</option><option>Crane</option><option>Forklift</option></select></div>
              <div className="form-group"><label>License Plate Number</label><input type="text" className="form-input" placeholder="e.g., GT 1234-24" /></div>
              <div className="form-group"><label>Vehicle Motion</label><select className="form-input"><option>Forward</option><option>Reversing</option><option>Stationary</option><option>Turning</option></select></div>
              <div className="form-group"><label>Incident Type</label><select className="form-input"><option>Ran off roadway</option><option>Struck other vehicle</option><option>Other vehicle struck ours</option></select></div>
              <div className="form-group"><label>Driver Name</label><input type="text" className="form-input" /></div>
              <div className="form-group"><label>Driver License No.</label><input type="text" className="form-input" /></div>
            </div>
          </div>
        )}

        {incidentType === 'property' && (
          <div className="form-grid dynamic-section bg-yellow">
            <div className="form-group"><label>Equipment Type</label><input type="text" className="form-input" placeholder="e.g., Excavator" /></div>
            <div className="form-group"><label>Equipment Owner</label><select className="form-input"><option>Client</option><option>Contractor</option><option>Employee</option><option>Third Party</option><option>Company</option></select></div>
            <div className="form-group"><label>Type of Damage</label><select className="form-input"><option>Structural</option><option>Theft</option><option>Mechanical</option><option>Natural Phenomenon</option><option>Other</option></select></div>
            <div className="form-group"><label>Damage Description</label><input type="text" className="form-input" placeholder="Describe the damage..." /></div>
          </div>
        )}

        {incidentType === 'environmental' && (
          <div className="dynamic-section bg-green">
            <div className="form-grid">
              <div className="form-group"><label>Substance Released</label><input type="text" className="form-input" placeholder="e.g., Diesel" /></div>
              <div className="form-group"><label>Estimated Quantity</label><input type="number" className="form-input" placeholder="e.g., 50" /></div>
              <div className="form-group"><label>Containment Status</label><select className="form-input"><option>Contained</option><option>Spreading</option><option>Cleaned up</option></select></div>
            </div>
          </div>
        )}

        {incidentType === 'occupational-illness' && (
          <div className="form-grid dynamic-section bg-purple">
            <div className="form-group"><label>Illness Category</label><select className="form-input"><option>Respiratory</option><option>Hearing Loss</option><option>Skin</option><option>Musculoskeletal</option><option>HAVS</option><option>Chemical</option></select></div>
            <div className="form-group"><label>Suspected Cause</label><select className="form-input"><option>Silica Dust</option><option>Noise</option><option>Chemicals</option><option>Vibration</option><option>Ergonomics</option></select></div>
            <div className="form-group"><label>Diagnosed By</label><input type="text" className="form-input" placeholder="Medical practitioner name" /></div>
            <div className="form-group"><label>Reportable to Regulator?</label><select className="form-input"><option>Yes</option><option>No</option><option>Pending</option></select></div>
          </div>
        )}

        <h3 className="form-section-title mt-32">{actionsSectionNumber}. Actions & Regulatory Reporting</h3>
        <div className="form-group"><label>Immediate Action Taken *</label><textarea className="form-input" rows={3} placeholder="What was done immediately?" value={immediateAction} onChange={(e) => setImmediateAction(e.target.value)}></textarea></div>
        <div className="form-grid mt-16">
          <div className="form-group">
            <label>Reported to Regulator?</label>
            <select className="form-input" value={reportedToRegulator} onChange={(e) => setReportedToRegulator(e.target.value)}>
              <option value="no">No</option><option value="yes">Yes</option><option value="pending">Pending</option>
            </select>
          </div>
          {reportedToRegulator === 'yes' && (
            <>
              <div className="form-group"><label>Regulator Notified Time</label><input type="datetime-local" className="form-input" value={regulatorTime} onChange={(e) => setRegulatorTime(e.target.value)} /></div>
              <div className="form-group"><label>Report Reference Number</label><input type="text" className="form-input" value={regulatorRef} onChange={(e) => setRegulatorRef(e.target.value)} /></div>
            </>
          )}
        </div>

        <h3 className="form-section-title mt-32">{attachmentsSectionNumber}. Attachments</h3>
        <div className="upload-container">
          <input type="file" id="file-upload" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="file-upload" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Click to upload photos or documents"}</span>
            <span className="upload-hint">PNG, JPG, PDF up to 10MB</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/incidents" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Incident</button>
      </div>
    </div>
  );
}