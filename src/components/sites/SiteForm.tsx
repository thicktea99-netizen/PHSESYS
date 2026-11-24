// src/components/sites/SiteForm.tsx

interface SiteFormProps {
  newSiteName: string;
  setNewSiteName: (v: string) => void;
  newSiteLocation: string;
  setNewSiteLocation: (v: string) => void;
  newSiteProjectId: string;
  setNewSiteProjectId: (v: string) => void;
  newSiteAssemblyPoint: string;
  setNewSiteAssemblyPoint: (v: string) => void;
  newSiteHospitalName: string;
  setNewSiteHospitalName: (v: string) => void;
  newSiteHospitalPhone: string;
  setNewSiteHospitalPhone: (v: string) => void;
  newSiteFirstAider: boolean;
  setNewSiteFirstAider: (v: boolean) => void;
  projectsList: { id: string, project_name: string }[];
  onAdd: () => void;
}

export default function SiteForm({
  newSiteName, setNewSiteName,
  newSiteLocation, setNewSiteLocation,
  newSiteProjectId, setNewSiteProjectId,
  newSiteAssemblyPoint, setNewSiteAssemblyPoint,
  newSiteHospitalName, setNewSiteHospitalName,
  newSiteHospitalPhone, setNewSiteHospitalPhone,
  newSiteFirstAider, setNewSiteFirstAider,
  projectsList, onAdd
}: SiteFormProps) {
  return (
    <div className="form-card mb-24">
      <h3 className="form-section-title">Add New Site</h3>
      <div className="form-grid">
        <div className="form-group"><label>Site Name *</label><input type="text" className="form-input" value={newSiteName} onChange={(e) => setNewSiteName(e.target.value)} /></div>
        <div className="form-group">
          <label>Project</label>
          <select className="form-input" value={newSiteProjectId} onChange={(e) => setNewSiteProjectId(e.target.value)}>
            <option value="">Select Project...</option>
            {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Location</label><input type="text" className="form-input" value={newSiteLocation} onChange={(e) => setNewSiteLocation(e.target.value)} /></div>
        <div className="form-group"><label>Assembly Point</label><input type="text" className="form-input" placeholder="e.g., Main Gate" value={newSiteAssemblyPoint} onChange={(e) => setNewSiteAssemblyPoint(e.target.value)} /></div>
        <div className="form-group"><label>Nearest Hospital</label><input type="text" className="form-input" placeholder="e.g., Ridge Hospital" value={newSiteHospitalName} onChange={(e) => setNewSiteHospitalName(e.target.value)} /></div>
        <div className="form-group"><label>Hospital Phone</label><input type="tel" className="form-input" placeholder="e.g., 0302123456" value={newSiteHospitalPhone} onChange={(e) => setNewSiteHospitalPhone(e.target.value.replace(/\D/g, ''))} /></div>
        <div className="form-group" style={{ justifyContent: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
            <input type="checkbox" checked={newSiteFirstAider} onChange={(e) => setNewSiteFirstAider(e.target.checked)} /> First Aider on Site
          </label>
        </div>
        <div className="form-group" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onAdd}>Add Site</button>
        </div>
      </div>
    </div>
  );
}