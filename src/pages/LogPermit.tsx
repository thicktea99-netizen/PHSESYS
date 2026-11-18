// src/pages/LogPermit.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';
import '../styles/LogPermit.css';

interface Hazard { id: number; hazard: string; consequence: string; control: string; }

export default function LogPermit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [permitType, setPermitType] = useState('');
  const [crossReference, setCrossReference] = useState('');
  const [contractor, setContractor] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorContact, setSupervisorContact] = useState('');
  const [totalHeadcount, setTotalHeadcount] = useState('');
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [simopsRequired, setSimopsRequired] = useState(false);
  const [simopsTime, setSimopsTime] = useState('');
  const [simopsPhysical, setSimopsPhysical] = useState('');
  const [simopsJoint, setSimopsJoint] = useState('');
  const [simopsSupervisor, setSimopsSupervisor] = useState('');
  const [assemblyPoint, setAssemblyPoint] = useState('');
  const [rescuePlan, setRescuePlan] = useState(false);
  const [firstAider, setFirstAider] = useState(false);
  const [hospital, setHospital] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [issuerRole, setIssuerRole] = useState('');
  const [issuerCompany, setIssuerCompany] = useState('');
  const [issuerContact, setIssuerContact] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverRole, setReceiverRole] = useState('');
  const [receiverCompany, setReceiverCompany] = useState('');
  const [receiverContact, setReceiverContact] = useState('');
  const [approverName, setApproverName] = useState('');
  const [approverRole, setApproverRole] = useState('');
  const [approverCompany, setApproverCompany] = useState('');
  const [approverContact, setApproverContact] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('Pending');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [status, setStatus] = useState('Active');
  const [statusNotes, setStatusNotes] = useState('');
  const [workStatus, setWorkStatus] = useState('');
  const [handbackName, setHandbackName] = useState('');
  const [handbackRole, setHandbackRole] = useState('');
  const [handbackDate, setHandbackDate] = useState('');
  const [acceptedName, setAcceptedName] = useState('');
  const [acceptedRole, setAcceptedRole] = useState('');
  const [acceptedDate, setAcceptedDate] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [sitesList, setSitesList] = useState<{ id: string, name: string }[]>([]);
  const [permitTypes, setPermitTypes] = useState<{ id: string, option_value: string }[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('sites').select('id, name').eq('status', 'active');
      if (sitesData) setSitesList(sitesData);
      const { data: typeData } = await supabase.from('dropdown_options').select('id, option_value').eq('category', 'permit_type').order('option_value');
      if (typeData) setPermitTypes(typeData);
    };
    fetchData();
    if (id) fetchPermit();
  }, [id]);

  const fetchPermit = async () => {
    try {
      const { data: pData, error } = await supabase.from('permits').select('*').eq('id', id).single();
      if (error) throw error;
      setPermitType(pData.permit_type || '');
      setCrossReference(pData.cross_reference || '');
      setContractor(pData.contractor || '');
      setSupervisorName(pData.supervisor_name || '');
      setSupervisorContact(pData.supervisor_contact || '');
      setTotalHeadcount(pData.total_headcount?.toString() || '');
      setSite(pData.site || '');
      setArea(pData.area || '');
      setWorkDescription(pData.work_description || '');
      setSimopsRequired(pData.simops_required || false);
      setSimopsTime(pData.simops_time_separation || '');
      setSimopsPhysical(pData.simops_physical_separation || '');
      setSimopsJoint(pData.simops_joint_coordination || '');
      setSimopsSupervisor(pData.simops_overlapping_supervisor || '');
      setAssemblyPoint(pData.emergency_assembly_point || '');
      setRescuePlan(pData.rescue_plan_required || false);
      setFirstAider(pData.first_aider_present || false);
      setHospital(pData.nearest_hospital || '');
      setEmergencyContact(pData.emergency_contact || '');
      setIssuerName(pData.issuer_name || '');
      setIssuerRole(pData.issuer_role || '');
      setIssuerCompany(pData.issuer_company || '');
      setIssuerContact(pData.issuer_contact || '');
      setReceiverName(pData.receiver_name || '');
      setReceiverRole(pData.receiver_role || '');
      setReceiverCompany(pData.receiver_company || '');
      setReceiverContact(pData.receiver_contact || '');
      setApproverName(pData.approver_name || '');
      setApproverRole(pData.approver_role || '');
      setApproverCompany(pData.approver_company || '');
      setApproverContact(pData.approver_contact || '');
      setApprovalStatus(pData.approval_status || 'Pending');
      setValidFrom(pData.valid_from ? pData.valid_from.slice(0, 16) : '');
      setValidTo(pData.valid_to ? pData.valid_to.slice(0, 16) : '');
      setStatus(pData.status || 'Active');
      setStatusNotes(pData.status_notes || '');
      setWorkStatus(pData.work_status || '');
      setHandbackName(pData.handback_by_name || '');
      setHandbackRole(pData.handback_by_role || '');
      setHandbackDate(pData.handback_datetime ? pData.handback_datetime.slice(0, 16) : '');
      setAcceptedName(pData.accepted_by_name || '');
      setAcceptedRole(pData.accepted_by_role || '');
      setAcceptedDate(pData.accepted_datetime ? pData.accepted_datetime.slice(0, 16) : '');
      setClosureNotes(pData.closure_notes || '');
      const { data: hData } = await supabase.from('permit_hazards').select('*').eq('permit_id', id);
      if (hData) setHazards(hData.map((h, i) => ({ id: Date.now() + i, hazard: h.hazard, consequence: h.consequence, control: h.control_measure || '' })));
    } catch (error: any) {
      alert("Error loading permit: " + error.message);
      navigate('/permits');
    } finally {
      setLoading(false);
    }
  };

  const addHazard = () => setHazards([...hazards, { id: Date.now(), hazard: '', consequence: '', control: '' }]);
  const removeHazard = (id: number) => setHazards(hazards.filter(h => h.id !== id));
  const updateHazard = (id: number, field: keyof Hazard, value: string) => {
    setHazards(hazards.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    if (!permitType || !site || !workDescription || !issuerName || !receiverName || !validFrom || !validTo) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      let permitId = id;
      const payload = {
        permit_type: permitType, cross_reference: crossReference, contractor, supervisor_name: supervisorName, supervisor_contact: supervisorContact,
        total_headcount: totalHeadcount ? parseInt(totalHeadcount) : null, site, area, work_description: workDescription,
        simops_required: simopsRequired, simops_time_separation: simopsTime, simops_physical_separation: simopsPhysical,
        simops_joint_coordination: simopsJoint, simops_overlapping_supervisor: simopsSupervisor,
        emergency_assembly_point: assemblyPoint, rescue_plan_required: rescuePlan, first_aider_present: firstAider,
        nearest_hospital: hospital, emergency_contact: emergencyContact,
        issuer_name: issuerName, issuer_role: issuerRole, issuer_company: issuerCompany, issuer_contact: issuerContact,
        receiver_name: receiverName, receiver_role: receiverRole, receiver_company: receiverCompany, receiver_contact: receiverContact,
        approver_name: approverName, approver_role: approverRole, approver_company: approverCompany, approver_contact: approverContact,
        approval_status: approvalStatus, valid_from: validFrom, valid_to: validTo, status, status_notes: statusNotes,
        work_status: workStatus, handback_by_name: handbackName, handback_by_role: handbackRole,
        handback_datetime: handbackDate || null, accepted_by_name: acceptedName, accepted_by_role: acceptedRole,
        accepted_datetime: acceptedDate || null, closure_notes: closureNotes
      };

      if (!permitId) {
        const { data, error } = await supabase.from('permits').insert([payload]).select().single();
        if (error) throw error;
        permitId = data.id;

        // Log to audit trail
        await supabase.from('audit_logs').insert([{
          module: 'Permits',
          action: 'Issued Permit',
          reference: `PTW-${String(data.permit_number).padStart(4, '0')}`
        }]);
      } else {
        const { error } = await supabase.from('permits').update(payload).eq('id', permitId);
        if (error) throw error;
        await supabase.from('permit_hazards').delete().eq('permit_id', permitId);
      }

      if (hazards.length > 0) {
        const hazardData = hazards.map(h => ({ permit_id: permitId, hazard: h.hazard, consequence: h.consequence, control_measure: h.control }));
        const { error: hazError } = await supabase.from('permit_hazards').insert(hazardData);
        if (hazError) throw hazError;
      }

      alert("Permit saved successfully!");
      navigate('/permits');
    } catch (error: any) {
      alert("Error saving permit: " + error.message);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading permit...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/permits" className="back-link"><ArrowLeft size={24} /></Link>
          <div><h1>{id ? 'Edit Permit' : 'Issue Permit to Work'}</h1><p className="page-subtitle">Authorize and track high-risk work.</p></div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Permit Administration</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Permit Type *</label>
            <select className="form-input" value={permitType} onChange={(e) => setPermitType(e.target.value)}>
              <option value="">Select Type...</option>
              {permitTypes.map((type) => (<option key={type.id} value={type.option_value}>{type.option_value}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Cross-Reference (JSA/RAMS No.)</label><input type="text" className="form-input" value={crossReference} onChange={(e) => setCrossReference(e.target.value)} /></div>
          <div className="form-group"><label>Contractor / Subcontractor</label><input type="text" className="form-input" value={contractor} onChange={(e) => setContractor(e.target.value)} /></div>
          <div className="form-group"><label>Supervisor Name</label><input type="text" className="form-input" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} /></div>
          <div className="form-group"><label>Supervisor Contact</label><input type="tel" className="form-input" placeholder="10-digit Contact" value={supervisorContact} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setSupervisorContact(val); }} /></div>
          <div className="form-group"><label>Total Headcount</label><input type="number" className="form-input" value={totalHeadcount} onChange={(e) => setTotalHeadcount(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">2. Task & Location Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Site *</label>
            <select className="form-input" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">Select Site...</option>
              {sitesList.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
            </select>
          </div>
          <div className="form-group"><label>Area / Location</label><input type="text" className="form-input" value={area} onChange={(e) => setArea(e.target.value)} /></div>
          <div className="form-group span-2"><label>Work Description *</label><textarea className="form-input" rows={3} placeholder="Describe the work to be performed..." value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} /></div>
        </div>

        <h3 className="form-section-title mt-32">3. Hazards, Controls & SIMOPs</h3>
        <div className="findings-container">
          <div className="findings-header">
            <div><h5>Hazards & Controls</h5></div>
            <button type="button" onClick={addHazard} className="btn-primary btn-small"><Plus size={14} /> Add Hazard</button>
          </div>
          {hazards.map((h, index) => (
            <div key={h.id} className="finding-card">
              <div className="finding-card-header"><h6>Hazard #{index + 1}</h6><button type="button" onClick={() => removeHazard(h.id)} className="btn-icon danger"><Trash2 size={14} /></button></div>
              <div className="form-grid">
                <div className="form-group"><label>Hazard Identified</label><input type="text" className="form-input" value={h.hazard} onChange={(e) => updateHazard(h.id, 'hazard', e.target.value)} /></div>
                <div className="form-group"><label>Potential Consequence</label><input type="text" className="form-input" value={h.consequence} onChange={(e) => updateHazard(h.id, 'consequence', e.target.value)} /></div>
                <div className="form-group span-2"><label>Control Measure</label><input type="text" className="form-input" value={h.control} onChange={(e) => updateHazard(h.id, 'control', e.target.value)} /></div>
              </div>
            </div>
          ))}
          
          <div className="checkbox-group mt-16">
            <input type="checkbox" id="simops" checked={simopsRequired} onChange={(e) => setSimopsRequired(e.target.checked)} />
            <label htmlFor="simops">SIMOPs Required (Simultaneous Operations)</label>
          </div>
          {simopsRequired && (
            <div className="form-grid mt-16" style={{ padding: '16px', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a' }}>
              <div className="form-group"><label>Time Separation</label><input type="text" className="form-input" value={simopsTime} onChange={(e) => setSimopsTime(e.target.value)} /></div>
              <div className="form-group"><label>Physical Separation</label><input type="text" className="form-input" value={simopsPhysical} onChange={(e) => setSimopsPhysical(e.target.value)} /></div>
              <div className="form-group"><label>Joint Coordination</label><input type="text" className="form-input" value={simopsJoint} onChange={(e) => setSimopsJoint(e.target.value)} /></div>
              <div className="form-group"><label>Overlapping Supervisor</label><input type="text" className="form-input" value={simopsSupervisor} onChange={(e) => setSimopsSupervisor(e.target.value)} /></div>
            </div>
          )}
        </div>

        <h3 className="form-section-title mt-32">4. Emergency Preparedness</h3>
        <div className="form-grid">
          <div className="form-group"><label>Emergency Assembly Point</label><input type="text" className="form-input" value={assemblyPoint} onChange={(e) => setAssemblyPoint(e.target.value)} /></div>
          <div className="form-group"><label>Nearest Hospital</label><input type="text" className="form-input" value={hospital} onChange={(e) => setHospital(e.target.value)} /></div>
          <div className="form-group"><label>Emergency Contact</label><input type="tel" className="form-input" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} /></div>
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" checked={rescuePlan} onChange={(e) => setRescuePlan(e.target.checked)} /> Rescue Plan Required</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><input type="checkbox" checked={firstAider} onChange={(e) => setFirstAider(e.target.checked)} /> First Aider on Site</label>
          </div>
        </div>

        <h3 className="form-section-title mt-32">5. Authorization</h3>
        <h4 className="auth-sub-title">Issuing Officer</h4>
        <div className="form-grid">
          <div className="form-group"><label>Name *</label><input type="text" className="form-input" value={issuerName} onChange={(e) => setIssuerName(e.target.value)} /></div>
          <div className="form-group"><label>Role</label><input type="text" className="form-input" value={issuerRole} onChange={(e) => setIssuerRole(e.target.value)} /></div>
          <div className="form-group"><label>Company</label><input type="text" className="form-input" value={issuerCompany} onChange={(e) => setIssuerCompany(e.target.value)} /></div>
          <div className="form-group"><label>Contact</label><input type="tel" className="form-input" value={issuerContact} onChange={(e) => setIssuerContact(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
        </div>
        <h4 className="auth-sub-title mt-16">Receiving Party</h4>
        <div className="form-grid">
          <div className="form-group"><label>Name *</label><input type="text" className="form-input" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} /></div>
          <div className="form-group"><label>Role</label><input type="text" className="form-input" value={receiverRole} onChange={(e) => setReceiverRole(e.target.value)} /></div>
          <div className="form-group"><label>Company</label><input type="text" className="form-input" value={receiverCompany} onChange={(e) => setReceiverCompany(e.target.value)} /></div>
          <div className="form-group"><label>Contact</label><input type="tel" className="form-input" value={receiverContact} onChange={(e) => setReceiverContact(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
        </div>
        <h4 className="auth-sub-title mt-16">Approving Party</h4>
        <div className="form-grid">
          <div className="form-group"><label>Name</label><input type="text" className="form-input" value={approverName} onChange={(e) => setApproverName(e.target.value)} /></div>
          <div className="form-group"><label>Role</label><input type="text" className="form-input" value={approverRole} onChange={(e) => setApproverRole(e.target.value)} /></div>
          <div className="form-group"><label>Company</label><input type="text" className="form-input" value={approverCompany} onChange={(e) => setApproverCompany(e.target.value)} /></div>
          <div className="form-group"><label>Contact</label><input type="tel" className="form-input" value={approverContact} onChange={(e) => setApproverContact(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
          <div className="form-group"><label>Approval Status</label><select className="form-input" value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
        </div>

        <h3 className="form-section-title mt-32">6. Validity & Status</h3>
        <div className="form-grid">
          <div className="form-group"><label>Valid From *</label><input type="datetime-local" className="form-input" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} /></div>
          <div className="form-group"><label>Valid To *</label><input type="datetime-local" className="form-input" value={validTo} onChange={(e) => setValidTo(e.target.value)} /></div>
          <div className="form-group"><label>Status</label><select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="Active">Active</option><option value="Suspended">Suspended</option><option value="Cancelled">Cancelled</option><option value="Closed">Closed</option></select></div>
          {(status === 'Suspended' || status === 'Cancelled') && (
            <div className="form-group"><label>Reason for {status}</label><input type="text" className="form-input" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} /></div>
          )}
        </div>

        <h3 className="form-section-title mt-32">7. Closure & Handback</h3>
        <div className="form-grid">
          <div className="form-group"><label>Work Status</label><select className="form-input" value={workStatus} onChange={(e) => setWorkStatus(e.target.value)}><option value="">Select...</option><option value="Completed">Completed</option><option value="Incomplete">Incomplete</option></select></div>
          <div className="form-group"></div>
          <div className="form-group"><label>Handback By (Name)</label><input type="text" className="form-input" value={handbackName} onChange={(e) => setHandbackName(e.target.value)} /></div>
          <div className="form-group"><label>Handback By (Role)</label><input type="text" className="form-input" value={handbackRole} onChange={(e) => setHandbackRole(e.target.value)} /></div>
          <div className="form-group"><label>Handback Date/Time</label><input type="datetime-local" className="form-input" value={handbackDate} onChange={(e) => setHandbackDate(e.target.value)} /></div>
          <div className="form-group"></div>
          <div className="form-group"><label>Accepted By (Name)</label><input type="text" className="form-input" value={acceptedName} onChange={(e) => setAcceptedName(e.target.value)} /></div>
          <div className="form-group"><label>Accepted By (Role)</label><input type="text" className="form-input" value={acceptedRole} onChange={(e) => setAcceptedRole(e.target.value)} /></div>
          <div className="form-group"><label>Accepted Date/Time</label><input type="datetime-local" className="form-input" value={acceptedDate} onChange={(e) => setAcceptedDate(e.target.value)} /></div>
          <div className="form-group span-2"><label>Closure Notes</label><textarea className="form-input" rows={2} value={closureNotes} onChange={(e) => setClosureNotes(e.target.value)}></textarea></div>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/permits" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Save Permit</button>
      </div>
    </div>
  );
}