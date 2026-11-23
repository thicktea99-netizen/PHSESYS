// src/components/documents/DocumentList.tsx
import { Trash2, Pin, Download } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_type: string;
  is_pinned: boolean;
}

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, current: boolean) => void;
}

export default function DocumentList({ documents, loading, onDelete, onTogglePin }: DocumentListProps) {
  // Group by category
  const grouped: { [key: string]: Document[] } = {};
  documents.forEach(doc => {
    if (!grouped[doc.category]) grouped[doc.category] = [];
    grouped[doc.category].push(doc);
  });

  if (loading) return <div className="table-message">Loading documents...</div>;
  if (documents.length === 0) return <div className="table-message">No documents found.</div>;

  return (
    <div className="doc-groups">
      {Object.keys(grouped).map(category => (
        <div key={category} className="doc-group">
          <h3 className="doc-group-title">{category} ({grouped[category].length})</h3>
          <div className="doc-list">
            {grouped[category].map(doc => (
              <div key={doc.id} className={`doc-item ${doc.is_pinned ? 'pinned' : ''}`}>
                <div className="doc-info">
                  <div className="doc-title-row">
                    <button 
                      className={`pin-btn ${doc.is_pinned ? 'active' : ''}`} 
                      onClick={() => onTogglePin(doc.id, doc.is_pinned)}
                    >
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
                  <button className="btn-icon danger" onClick={() => onDelete(doc.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}