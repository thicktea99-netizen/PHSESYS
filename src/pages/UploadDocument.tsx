// src/pages/UploadDocument.tsx
import { useState } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Forms.css';
import '../styles/LogInspection.css';

export default function UploadDocument() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [site, setSite] = useState('');
  const [project, setProject] = useState('');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = async () => {
    if (!title || !category || !selectedFile) {
      alert("Please fill in required fields: Title, Category, and File.");
      return;
    }

    try {
      // 1. Upload File
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `doc-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('inspection-photos').upload(fileName, selectedFile);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('inspection-photos').getPublicUrl(fileName);
      const fileUrl = urlData.publicUrl;

      // 2. Save Record
      const { error } = await supabase
        .from('documents')
        .insert([{
          title: title,
          category: category,
          description: description,
          file_url: fileUrl,
          file_type: fileExt?.toUpperCase(),
          site: site,
          project: project,
          tags: tags,
          is_pinned: isPinned,
          uploaded_by: 'Kwame Asante' // We can make this dynamic later
        }]);

      if (error) throw error;

      alert("Document uploaded successfully!");
      window.location.href = '/documents';

    } catch (error: any) {
      alert("Error uploading document: " + error.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="header-left">
          <Link to="/documents" className="back-link"><ArrowLeft size={24} /></Link>
          <div>
            <h1>Upload Document</h1>
            <p className="page-subtitle">Add a file to your document library.</p>
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3 className="form-section-title">1. Document Details</h3>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Document Title *</label>
            <input type="text" className="form-input" placeholder="e.g., HSE Policy 2026" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category...</option>
              <option value="Policies">Policies</option>
              <option value="Procedures">Procedures</option>
              <option value="Method Statements">Method Statements / RAMS</option>
              <option value="Risk Assessments">Risk Assessments</option>
              <option value="SDS">SDS (Safety Data Sheets)</option>
              <option value="Statutory Certificates">Statutory Certificates</option>
              <option value="Investigation Templates">Investigation Templates</option>
              <option value="Inspection Forms">Inspection Forms</option>
              <option value="Toolbox Talk Topics">Toolbox Talk Topics</option>
              <option value="Emergency Plans">Emergency Plans</option>
              <option value="Regulations">Regulations / Acts</option>
              <option value="Drawings">Drawings / Site Layouts</option>
            </select>
          </div>
          <div className="form-group">
            <label>File Type (Auto-detected)</label>
            <input type="text" className="form-input" value={selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() : ''} disabled placeholder="Upload a file to see type" />
          </div>
          <div className="form-group span-2">
            <label>Description</label>
            <input type="text" className="form-input" placeholder="Short summary of the document..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <h3 className="form-section-title mt-32">2. Categorization (Optional)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Site</label>
            <input type="text" className="form-input" placeholder="e.g., Podium Zone" value={site} onChange={(e) => setSite(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Project</label>
            <input type="text" className="form-input" placeholder="e.g., Riverside Tower" value={project} onChange={(e) => setProject(e.target.value)} />
          </div>
          <div className="form-group span-2">
            <label>Tags (Comma separated)</label>
            <input type="text" className="form-input" placeholder="e.g., fire, evacuation, height" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
        </div>

        <div className="checkbox-group mt-16">
          <input type="checkbox" id="pinDoc" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
          <label htmlFor="pinDoc">Pin this document to the Dashboard for quick access</label>
        </div>

        <h3 className="form-section-title mt-32">3. Upload File</h3>
        <div className="upload-container">
          <input type="file" id="doc-file" className="hidden-input" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
          <label htmlFor="doc-file" className="upload-label">
            <Paperclip size={24} color="var(--text-muted)" />
            <span className="upload-text">{selectedFile ? selectedFile.name : "Click to select a file (PDF, Image, Doc)"}</span>
          </label>
        </div>
      </div>

      <div className="sticky-action-bar">
        <Link to="/documents" className="btn-secondary">Cancel</Link>
        <button className="btn-primary" onClick={handleSave}>Upload Document</button>
      </div>
    </div>
  );
}