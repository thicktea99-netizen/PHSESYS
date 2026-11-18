

// src/pages/InspectionDetail.tsx
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/InspectionDetail.css';

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inspection, setInspection] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspectionDetails();
  }, [id]);

  const fetchInspectionDetails = async () => {
    try {
      setLoading(true);
      const { data: inspData, error: inspError } = await supabase
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (inspError) throw inspError;
      setInspection(inspData);

      const { data: findData, error: findError } = await supabase
        .from('inspection_findings')
        .select('*')
        .eq('inspection_id', id);

      if (findError) throw findError;
      setFindings(findData || []);

    } catch (error: any) {
      alert("Error fetching details: " + error.message);
      navigate('/inspections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading inspection details...</div>;
  if (!inspection) return <div className="loading-state">Inspection not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/inspections" className="back-link">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1>INS-{String(inspection.inspection_number).padStart(4, '0')} - {inspection.inspection_type}</h1>
            <p className="page-subtitle">{inspection.site} {inspection.area ? `(${inspection.area})` : ''} • {inspection.date}</p>
          </div>
        </div>
      </div>

      <div className="form-card mb-24">
        <h3 className="form-section-title">Inspection Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Inspector Name</label>
            <input type="text" className="form-input" value={inspection.inspector_name || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label>Inspector Role</label>
            <input type="text" className="form-input" value={inspection.inspector_role || 'N/A'} disabled />
          </div>
          <div className="form-group">
            <label>Weather</label>
            <input type="text" className="form-input" value={inspection.weather || 'N/A'} disabled />
          </div>
        </div>
        <div className="form-group mt-16">
          <label>Overall Notes</label>
          <textarea className="form-input" rows={2} value={inspection.overall_notes || 'No notes provided.'} disabled></textarea>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">Findings ({findings.length})</h3>
        
        {findings.length === 0 ? (
          <p className="no-findings-success">✅ No findings. Clean inspection!</p>
        ) : (
          <div className="findings-list">
            {findings.map((finding, index) => (
              <div key={finding.id} className="finding-detail-card">
                <div className="finding-detail-header">
                  <h4>Finding #{index + 1} - {finding.finding_type}</h4>
                  <span className={`badge severity-${finding.severity.toLowerCase()}`}>{finding.severity}</span>
                </div>
                <p className="finding-text"><strong>Description:</strong> {finding.description}</p>
                <p className="finding-text"><strong>Action Taken:</strong> {finding.immediate_action || 'None recorded'}</p>
                {finding.requires_capa && (
                  <span className="badge status-investigating mt-8">CAPA Required</span>
                )}
                {finding.photo_url && (
                  <div className="finding-photo">
                    <img src={finding.photo_url} alt="Finding Evidence" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}