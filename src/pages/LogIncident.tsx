// src/pages/LogIncident.tsx
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';

import {supabase} from '../lib/supabase';


import '../styles/Forms.css';

interface Witness {
  id: number;
  name: string;
  contact: string;
  statement: string;
}

export default function LogIncident() {
  // --- CORE STATE ---
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('low');
  const [reportedToRegulator, setReportedToRegulator] = useState('no');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterRole, setReporterRole] = useState('');
  const [description, setDescription] = useState('');
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [activity, setActivity] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [regulatorRef, setRegulatorRef] = useState('');
  const [regulatorTime, setRegulatorTime] = useState('');
  
  // --- VEHICLE STATE ---
  const [vehicleAffiliation, setVehicleAffiliation] = useState('company');
  
  // --- WITNESS STATE ---
  const [witnesses, setWitnesses] = useState<Witness[]>([]);

  // --- ATTACHMENT STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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


    // --- DYNAMIC SECTION NUMBERING ---
  // If the type is near-miss (or empty), we skip section 3. 
  // So the next section becomes 3, and the last becomes 4.
  const isSpecificDetailsVisible = incidentType && incidentType !== 'near-miss';
  const actionsSectionNumber = isSpecificDetailsVisible ? 4 : 3;
  const attachmentsSectionNumber = isSpecificDetailsVisible ? 5 : 4;


    const handleSave = async () => {
    // 1. Basic Validation
        // 1. Basic Validation
    if (!incidentType || !date || !time || !description) {
      alert("Please fill in required fields: Type, Date, Time, and Description.");
      return;
    }

    // 2. Witness Phone Validation (Must be exactly 10 digits if filled)
    for (const witness of witnesses) {
      if (witness.contact && witness.contact.length !== 10) {
        alert(`Please enter a valid 10-digit phone number for witness: ${witness.name || 'Unnamed'}`);
        return; // Stops the save process
      }
    }
    



    try {
      // 2. Save the main incident to Supabase
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .insert([
          {
            incident_type: incidentType,
            date_of_occurrence: date,
            time_of_occurrence: time,
            severity: severity,
            reporter_name: reporterName,
            reporter_role: reporterRole,
            description: description,
            site: site,
            area: area,
            activity: activity,
            immediate_action: immediateAction,
            reported_to_regulator: reportedToRegulator,
            regulator_notified_time: regulatorTime || null,
            regulator_ref_number: regulatorRef
          }
        ])
        .select()
        .single();

      if (incidentError) throw incidentError;

      // 3. Save the Witnesses (if any were added)
      if (witnesses.length > 0) {
        const witnessData = witnesses.map(w => ({
          incident_id: incidentData.id, // Link to the incident we just created
          name: w.name,
          contact: w.contact,
          statement: w.statement
        }));
        
        const { error: witnessError } = await supabase
          .from('incident_witnesses')
          .insert(witnessData);
          
        if (witnessError) throw witnessError;
      }

      // 4. Success message and redirect
      alert("Incident saved successfully!");
      window.location.href = '/incidents'; 

    } catch (error: any) {
      alert("Error saving incident: " + error.message);
    }
  };



  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/incidents" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1>Log New Incident</h1>
            <p className="page-subtitle">Record a new incident or near-miss.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/incidents" className="btn-secondary">Cancel</Link>
          <button className="btn-primary" onClick={handleSave}>
            Save Incident
          </button>
        </div>
      </div>

      <div className="form-card">
        
        {/* SECTION 1: CORE DETAILS */}
        <h3 className="form-section-title">1. Core Details</h3>
        <div className="form-grid">
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
            <label>Date of Occurrence *</label>

            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />

          </div>

          <div className="form-group">
            <label>Time of Occurrence *</label>
            <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Severity *</label>
            <select className="form-input" value={severity} onChange={(e) => setSeverity(e.target.value)} disabled={incidentType === 'fatality'}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
              <option value="catastrophic">Catastrophic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Reporter Name *</label>
            <input type="text" className="form-input" value={reporterName} onChange={(e) => setReporterName(e.target.value)} placeholder="Who is reporting this?" />
          </div>

          <div className="form-group">
            <label>Reporter Role / Company</label>
            <input type="text" className="form-input" value={reporterRole} onChange={(e) => setReporterRole(e.target.value)} placeholder="e.g., Site Supervisor - JJ Ltd" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Describe what really happened *</label>
          <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened? Describe the sequence of events. Do not includes anybody's name..."></textarea>
        </div>

        {/* SECTION 2: LOCATION & PEOPLE */}
        <h3 className="form-section-title" style={{ marginTop: '32px' }}>2. Location & People</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              <option value="podium">Podium Zone</option>
              <option value="tower">Main Tower</option>
            </select>
          </div>

          <div className="form-group">
            <label>Area / Location Detail *</label>
            <input type="text" className="form-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g., Level 3 - Column B4" />
          </div>

          <div className="form-group">
            <label>Person Involved (Optional)</label>
            <select className="form-input">
              <option value="">Select Person...</option>
              <option value="john">John Mensah (ABC Scaffolding)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Activity / Task at Time of Incident</label>
            <input type="text" className="form-input" value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="e.g., Welding rebar couplers or walking casually" />
          </div>
        </div>

        {/* WITNESSES */}
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Witnesses</h4>
            <button type="button" onClick={addWitness} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              <Plus size={14} /> Add Witness
            </button>
          </div>
          
          {witnesses.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No witnesses added yet.</p>}

          {witnesses.map((witness) => (
            <div key={witness.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '12px', marginBottom: '12px', alignItems: 'start' }}>
              <input type="text" className="form-input" placeholder="Name" value={witness.name} onChange={(e) => updateWitness(witness.id, 'name', e.target.value)} />


              <input 
                type="tel" 
                className="form-input" 
                placeholder="10-digit Contact" 
                value={witness.contact} 
                onChange={(e) => {
                  // Remove any non-digit characters (like letters or dashes)
                  const numericValue = e.target.value.replace(/\D/g, '');
                  // Only update if it's 10 digits or less
                  if (numericValue.length <= 10) {
                    updateWitness(witness.id, 'contact', numericValue);
                  }
                }} 
              />             



              <input type="text" className="form-input" placeholder="Brief statement" value={witness.statement} onChange={(e) => updateWitness(witness.id, 'statement', e.target.value)} />
              <button type="button" onClick={() => removeWitness(witness.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '10px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* SECTION 3: DYNAMIC SPECIFIC DETAILS */}
        {isSpecificDetailsVisible && (
          <h3 className="form-section-title" style={{ marginTop: '32px' }}>3. Specific Details</h3>)}

        {/* INJURY (First Aid / LTI) */}
        {(incidentType === 'first-aid' || incidentType === 'lti') && (
          <div className="form-grid" style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div className="form-group">
              <label>Injury Classification</label>
              <select className="form-input">
                <option>Laceration</option><option>Sprain/Strain</option><option>Fracture</option>
                <option>Burn</option><option>Contusion</option><option>Amputation</option>
              </select>
            </div>
            <div className="form-group">
              <label>Body Part Affected</label>
              <select className="form-input">
                <option>Head</option><option>Neck</option><option>Back</option><option>Left Arm</option>
                <option>Right Arm</option><option>Left Hand</option><option>Right Hand</option><option>Legs</option>
              </select>
            </div>
            <div className="form-group">
              <label>Treatment Given</label>
              <input type="text" className="form-input" placeholder="e.g., Referred to clinic" />
            </div>
            <div className="form-group">
              <label>Lost Time Days</label>
              <input type="number" className="form-input" placeholder="0" />
            </div>
          </div>
        )}

        {/* FATALITY */}
        {incidentType === 'fatality' && (
          <div className="form-grid" style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            <div className="form-group">
              <label>Next of Kin Notified?</label>
              <select className="form-input"><option>Pending</option><option>Yes</option><option>No</option></select>
            </div>
            <div className="form-group">
              <label>Authority Notified</label>
              <select className="form-input"><option>Police</option><option>Factory Inspectorate</option><option>Ambulance</option><option>Multiple</option></select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Cause of Death</label>
              <input type="text" className="form-input" placeholder="e.g., Blunt force trauma, Asphyxiation" />
            </div>
          </div>
        )}

        {/* VEHICLE */}
        {incidentType === 'vehicle' && (
          <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <input type="radio" name="vehicleAff" value="company" checked={vehicleAffiliation === 'company'} onChange={() => setVehicleAffiliation('company')} />
                Company Vehicle
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <input type="radio" name="vehicleAff" value="non-company" checked={vehicleAffiliation === 'non-company'} onChange={() => setVehicleAffiliation('non-company')} />
                Non-Company Vehicle
              </label>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Vehicle Type</label>
                <select className="form-input"><option>Car</option><option>Pickup</option><option>Truck</option><option>Crane</option><option>Forklift</option></select>
              </div>
              <div className="form-group">
                <label>License Plate Number</label>
                <input type="text" className="form-input" placeholder="e.g., GT 1234-24" />
              </div>
              <div className="form-group">
                <label>Vehicle Motion</label>
                <select className="form-input"><option>Forward</option><option>Reversing</option><option>Stationary</option><option>Turning</option></select>
              </div>
              <div className="form-group">
                <label>Incident Type</label>
                <select className="form-input"><option>Ran off roadway</option><option>Struck other vehicle</option><option>Other vehicle struck ours</option></select>
              </div>
              <div className="form-group">
                <label>Driver Name</label>
                <input type="text" className="form-input" />
              </div>
              <div className="form-group">
                <label>Driver License No.</label>
                <input type="text" className="form-input" />
              </div>
            </div>
            {vehicleAffiliation === 'non-company' && (
              <div className="form-grid" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #bfdbfe' }}>
                <div className="form-group"><label>Third-Party Name</label><input type="text" className="form-input" /></div>
                <div className="form-group"><label>Third-Party Contact</label><input type="text" className="form-input" /></div>
                <div className="form-group"><label>Third-Party Insurance</label><input type="text" className="form-input" /></div>
              </div>
            )}
          </div>
        )}

        {/* PROPERTY / EQUIPMENT */}
        {incidentType === 'property' && (
          <div className="form-grid" style={{ padding: '16px', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
            <div className="form-group">
              <label>Equipment Type</label>
              <input type="text" className="form-input" placeholder="e.g., Excavator, Scaffold" />
            </div>
            <div className="form-group">
              <label>Equipment Owner</label>
              <select className="form-input"><option>Client</option><option>Contractor</option><option>Employee</option><option>Third Party</option><option>Company</option></select>
            </div>
            <div className="form-group">
              <label>Type of Damage</label>
              <select className="form-input"><option>Structural</option><option>Theft</option><option>Mechanical</option><option>Natural Phenomenon</option><option>Other</option></select>
            </div>
            <div className="form-group">
              <label>Damage Description</label>
              <input type="text" className="form-input" placeholder="Describe the damage..." />
            </div>
          </div>
        )}

        {/* ENVIRONMENTAL */}
        {incidentType === 'environmental' && (
          <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Substance Released</label>
                <input type="text" className="form-input" placeholder="e.g., Diesel, Hydraulic Oil" />
              </div>
              <div className="form-group">
                <label>Estimated Quantity</label>
                <input type="number" className="form-input" placeholder="e.g., 50" />
              </div>
              <div className="form-group">
                <label>Containment Status</label>
                <select className="form-input"><option>Contained</option><option>Spreading</option><option>Cleaned up</option></select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Affected Effects (Check all that apply)</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> People</label>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> Animals</label>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> Vegetation</label>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> Structures</label>
                <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" /> Equipment</label>
              </div>
            </div>
          </div>
        )}

        {/* OCCUPATIONAL ILLNESS */}
        {incidentType === 'occupational-illness' && (
          <div className="form-grid" style={{ padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
            <div className="form-group">
              <label>Illness Category</label>
              <select className="form-input"><option>Respiratory</option><option>Hearing Loss</option><option>Skin</option><option>Musculoskeletal</option><option>HAVS</option><option>Chemical</option></select>
            </div>
            <div className="form-group">
              <label>Suspected Cause</label>
              <select className="form-input"><option>Silica Dust</option><option>Noise</option><option>Chemicals</option><option>Vibration</option><option>Ergonomics</option></select>
            </div>
            <div className="form-group">
              <label>Diagnosed By</label>
              <input type="text" className="form-input" placeholder="Medical practitioner name" />
            </div>
            <div className="form-group">
              <label>Reportable to Regulator?</label>
              <select className="form-input"><option>Yes</option><option>No</option><option>Pending</option></select>
            </div>
          </div>
        )}

        {/* SECTION 4: ACTIONS & REGULATORY REPORTING */}

        <h3 
          className="form-section-title" 
          style={{ marginTop: '32px' }}
        >
          {actionsSectionNumber}. Actions & Regulatory Reporting
        </h3>
        
        <div className="form-group">
          <label>Immediate Action Taken *</label>

          <textarea className="form-input" rows={3} placeholder="What was done immediately? (e.g., Area cordoned off, first aid given)" value={immediateAction} onChange={(e) => setImmediateAction(e.target.value)}></textarea>

        </div>

        <div className="form-grid" style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label>Reported to Regulator?</label>
            <select className="form-input" value={reportedToRegulator} onChange={(e) => setReportedToRegulator(e.target.value)}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          {reportedToRegulator === 'yes' && (
            <>
              <div className="form-group">
                <label>Regulator Notified Time</label>
                <input type="datetime-local" className="form-input" value={regulatorTime} onChange={(e) => setRegulatorTime(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Report Reference Number</label>
                <input type="text" className="form-input" value={regulatorRef} onChange={(e) => setRegulatorRef(e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* SECTION 5: ATTACHMENTS */}
        <h3 className="form-section-title" style={{ marginTop: '32px' }}>{attachmentsSectionNumber}. Attachments</h3>
        <div style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <input 
            type="file" 
            id="file-upload" 
            style={{ display: 'none' }} 
            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
          />
          <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={24} color="var(--text-muted)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>
              {selectedFile ? selectedFile.name : "Click to upload photos or documents"}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, PDF up to 10MB</span>
          </label>
        </div>

      </div>
    </div>
  );
}