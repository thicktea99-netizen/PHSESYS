// src/pages/Documents.tsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, Pin, Search, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import '../styles/Documents.css';

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_type: string;
  is_pinned: boolean;
  created_at: string;
}

export default function Documents() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('documents').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      setDocs(data || []);
    } catch (error: any) {
      alert("Error fetching documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      setDocs(docs.filter(d => d.id !== id));
    } catch (error: any) {
      alert("Error deleting document: " + error.message);
    }
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('documents').update({ is_pinned: !currentStatus }).eq('id', id);
      if (error) throw error;
      setDocs(docs.map(d => d.id === id ? { ...d, is_pinned: !currentStatus } : d));
    } catch (error: any) {
      alert("Error pinning document: " + error.message);
    }
  };

  // Filter logic
    const filteredDocs = docs.filter(doc => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchLower) || 
      (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
      (doc.tags && doc.tags.toLowerCase().includes(searchLower)); // <-- Added tags to search
      
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  

  // Group by category for display
  const groupedDocs: { [key: string]: Document[] } = {};
  filteredDocs.forEach(doc => {
    if (!groupedDocs[doc.category]) groupedDocs[doc.category] = [];
    groupedDocs[doc.category].push(doc);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Document Library</h1>
          <p className="page-subtitle">Your filing cabinet for policies, procedures, and templates.</p>
        </div>
        <Link to="/documents/new" className="btn-primary"><Plus size={18} /> Upload Document</Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="doc-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>


        <select className="form-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ maxWidth: '250px' }}>
          <option value="All">All Categories</option>
          <option value="Policies">Policies</option>
          <option value="Procedures">Procedures</option>
          <option value="Method Statements">Method Statements</option>
          <option value="Risk Assessments">Risk Assessments</option>
          <option value="SDS">SDS</option>
          <option value="Statutory Certificates">Statutory Certificates</option>
          <option value="Inspection Forms">Inspection Forms</option>
          <option value="Investigation Templates">Investigation Templates</option>
          <option value="Toolbox Talk Topics">Toolbox Talk Topics</option>
          <option value="Emergency Plans">Emergency Plans</option>
          <option value="Regulations">Regulations</option>
          <option value="Drawings">Drawings</option>
        </select>

        




      </div>

      {loading ? (
        <div className="table-message">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="table-message">No documents found. Upload one to get started.</div>
      ) : (
        <div className="doc-groups">
          {Object.keys(groupedDocs).map(category => (
            <div key={category} className="doc-group">
              <h3 className="doc-group-title">{category} ({groupedDocs[category].length})</h3>
              <div className="doc-list">
                {groupedDocs[category].map(doc => (
                  <div key={doc.id} className={`doc-item ${doc.is_pinned ? 'pinned' : ''}`}>
                    <div className="doc-info">
                      <div className="doc-title-row">
                        <button className={`pin-btn ${doc.is_pinned ? 'active' : ''}`} onClick={() => togglePin(doc.id, doc.is_pinned)}>
                          <Pin size={16} />
                        </button>
                        <h4>{doc.title}</h4>
                        <span className="doc-type">{doc.file_type}</span>
                      </div>
                      {doc.description && <p className="doc-desc">{doc.description}</p>}
                    </div>
                    <div className="doc-actions">
                      <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn-icon" title="Download">
                        <Download size={18} />
                      </a>
                      <button className="btn-icon danger" onClick={() => handleDelete(doc.id)} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}