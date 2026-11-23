// src/components/documents/DocumentStats.tsx
import { FolderOpen, Pin, FileText, Tag } from 'lucide-react';

interface DocumentStatsProps {
  total: number;
  pinned: number;
  categories: number;
  totalSize?: string;
}

export default function DocumentStats({ total, pinned, categories }: DocumentStatsProps) {
  return (
    <div className="mini-stats-grid">
      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <FolderOpen size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{total}</span>
          <span className="mini-stat-label">Total Documents</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <Pin size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{pinned}</span>
          <span className="mini-stat-label">Pinned</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
          <FileText size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">{categories}</span>
          <span className="mini-stat-label">Categories</span>
        </div>
      </div>

      <div className="mini-stat-card">
        <div className="mini-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
          <Tag size={20} />
        </div>
        <div className="mini-stat-content">
          <span className="mini-stat-value">-</span>
          <span className="mini-stat-label">Tags</span>
        </div>
      </div>
    </div>
  );
}