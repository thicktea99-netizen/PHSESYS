// src/pages/IncidentDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/IncidentDetail.css';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [incident, setIncident] = useState<any>(null);
  const [witnesses, setWitnesses] = useState<any[]>([]);
  const [victims, setVictims] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [investigation, setInvestigation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  useEffect(() => {
    if (incident) setStatus(incident.status || 'reported');
  }, [incident]);

  const fetchIncidentDetails = async () => {
    try {
      setLoading(true);
      const { data: incData, error: incError } = await supabase.from('incidents').select('*').eq('id', id).single();
      if (incError) throw incError;
      setIncident(incData);

      const { data: witData } = await supabase.from('incident_witnesses').select('*').eq('incident_id', id);
      setWitnesses(witData || []);

      const { data: vicData } = await supabase.from('incident_victims').select('*').eq('incident_id', id);
      setVictims(vicData || []);

      const { data: phoData } = await supabase.from('incident_photos').select('*').eq('incident_id', id);
      setPhotos(phoData || []);

      const { data: invData } = await supabase.from('investigations').select('*').eq('incident_id', id).maybeSingle();
      setInvestigation(invData);

    } catch (error: any) {
      alert("Error fetching details: " + error.message);
      navigate('/incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setStatus(newStatus);
    const { error } = await supabase.from('incidents').update({ status: newStatus }).eq('id', id);
    if (error) alert("Failed to update status: " + error.message);
    else alert("Status updated!");
  };

  if (loading) return <div className="loading-state">Loading incident details...</div>;
  if (!incident) return <div className="loading-state">Incident not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/incidents" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>INC-{String(incident.incident_number).padStart(4, '0')} - {incident.incident_type.replace('-', ' ')}</h1>
            <p className="page-subtitle">{incident.site} {incident.area ? `(${incident.area})` : ''} • {incident.date_of_occurrence}</p>
          </div>
        </div>
      </div>

      {/* INVESTIGATION CARD - Moved to top */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">Investigation</h3>
        
        {!investigation ? (
          <div style={{ padding: '16px 0' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No investigation has been recorded for this incident yet.</p>
            <Link 
              to={`/incidents/${id}/investigation/new`} 
              className="btn-primary" 
              style={{ display: 'inline-flex', width: 'auto' }}
            >
              <Plus size={18} /> Start Investigation
            </Link>
          </div>
        ) : (
          <div>
            <div className="form-grid mb-16">
              <div className="form-group"><label>Method Used</label><input type="text" className="form-input" value={investigation.method_used} disabled /></div>
              <div className="form-group"><label>Investigator</label><input type="text" className="form-input" value={investigation.investigator_name} disabled /></div>
              <div className="form-group"><label>Date</label><input type="text" className="form-input" value={investigation.investigation_date} disabled /></div>
              <div className="form-group"><label>Status</label><input type="text" className="form-input" value={investigation.status} disabled /></div>
            </div>
            
            <div className="form-group mb-16"><label>Findings Summary</label><textarea className="form-input" rows={2} value={investigation.findings_summary || 'N/A'} disabled></textarea></div>
            <div className="form-group mb-16"><label>Root Cause</label><textarea className="form-input" rows={2} value={investigation.root_cause || 'N/A'} disabled></textarea></div>
            <div className="form-group mb-16"><label>Contributing Factors</label><textarea className="form-input" rows={2} value={investigation.contributing_factors || 'N/A'} disabled></textarea></div>
            <div className="form-group mb-16"><label>Corrective/Preventive Actions</label><textarea className="form-input" rows={2} value={investigation.corrective_actions || 'N/A'} disabled></textarea></div>
            
            {investigation.report_url && (
              <div className="mb-16">
                <a href={investigation.report_url} target="_blank" rel="noreferrer" className="evidence-link">View Investigation Report</a>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to={`/incidents/${id}/investigation`} className="btn-secondary">
                Edit Investigation
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* STATUS CARD */}
      <div className="form-card mb-24">
        <div className="status-update-row">
          <div>
            <h3 className="form-section-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>Incident Status</h3>
            <p className="status-hint">Update the current status of this incident.</p>
          </div>
          <select className={`table-select status-${status.replace(' ', '-')}`} style={{ fontSize: '0.9rem', padding: '8px 30px 8px 12px' }} value={status} onChange={(e) => handleUpdateStatus(e.target.value)}>
            <option value="reported">Reported</option>
            <option value="investigating">Investigating</option>
            <option value="actions pending">Actions Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">Core Details</h3>
        <div className="form-grid">
          <div className="form-group"><label>Date & Time</label><input type="text" className="form-input" value={`${incident.date_of_occurrence} at ${incident.time_of_occurrence}`} disabled /></div>
          <div className="form-group"><label>Severity</label><input type="text" className="form-input text-capitalize" value={incident.severity} disabled /></div>
          <div className="form-group"><label>Reporter Name</label><input type="text" className="form-input" value={incident.reporter_name} disabled /></div>
          <div className="form-group"><label>Reporter Role</label><input type="text" className="form-input" value={incident.reporter_role || 'N/A'} disabled /></div>
        </div>
        <div className="form-group mt-16"><label>Description of Event</label><textarea className="form-input" rows={4} value={incident.description} disabled></textarea></div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">Location & People</h3>
        <div className="form-grid">
          <div className="form-group"><label>Site</label><input type="text" className="form-input" value={incident.site} disabled /></div>
          <div className="form-group"><label>Area</label><input type="text" className="form-input" value={incident.area || 'N/A'} disabled /></div>
          <div className="form-group"><label>Activity / Task</label><input type="text" className="form-input" value={incident.activity || 'N/A'} disabled /></div>
          <div className="form-group"><label>Involved Item</label><input type="text" className="form-input" value={incident.involved_item || 'N/A'} disabled /></div>
        </div>
      </div>

      {/* VICTIMS CARD */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">Victims ({victims.length})</h3>
        {victims.length === 0 ? (
          <p className="no-witnesses">No victims recorded.</p>
        ) : (
          <div className="witness-list">
            {victims.map((v, index) => (
              <div key={v.id} className="witness-detail-card">
                <h4>Victim #{index + 1}: {v.victim_name || 'Unnamed'}</h4>
                <p><strong>Role:</strong> {v.victim_role || 'N/A'}</p>
                <p><strong>Contact:</strong> {v.victim_contact || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WITNESSES CARD */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">Witnesses ({witnesses.length})</h3>
        {witnesses.length === 0 ? (
          <p className="no-witnesses">No witnesses recorded.</p>
        ) : (
          <div className="witness-list">
            {witnesses.map((w, index) => (
              <div key={w.id} className="witness-detail-card">
                <h4>Witness #{index + 1}: {w.name}</h4>
                <p><strong>Contact:</strong> {w.contact || 'N/A'}</p>
                <p><strong>Statement:</strong> {w.statement || 'No statement provided'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PHOTOS CARD */}
      <div className="form-card mb-24">
        <h3 className="form-section-title">Photos ({photos.length})</h3>
        {photos.length === 0 ? (
          <p className="no-witnesses">No photos attached.</p>
        ) : (
          <div className="photo-grid">
            {photos.map((p, index) => (
              <div key={p.id} className="photo-item">
                <img src={p.photo_url} alt={`Photo ${index + 1}`} />
                {p.caption && <p>{p.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-card">
        <h3 className="form-section-title">Actions & Regulatory</h3>
        <div className="form-group"><label>Immediate Action Taken</label><textarea className="form-input" rows={3} value={incident.immediate_action} disabled></textarea></div>
        <div className="form-grid mt-16"> 
          <div className="form-group"><label>Reported to Regulator?</label><input type="text" className="form-input text-capitalize" value={incident.reported_to_regulator} disabled /></div>
          {incident.reported_to_regulator === 'yes' && (
            <>
              <div className="form-group"><label>Regulator Notified Time</label><input type="text" className="form-input" value={incident.regulator_notified_time || 'N/A'} disabled /></div>
              <div className="form-group"><label>Report Reference</label><input type="text" className="form-input" value={incident.regulator_ref_number || 'N/A'} disabled /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}