// src/components/audits/AuditFilters.tsx

interface AuditFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  sitesList: { id: string, name: string }[];
  siteFilter: string;
  onSiteChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function AuditFilters({ 
  statusFilter, onStatusChange, 
  typeFilter, onTypeChange,
  siteFilter, onSiteChange, 
  sitesList, searchQuery, onSearchChange 
}: AuditFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search audits by title or auditor..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Statuses</option>
        <option value="Open">Open</option>
        <option value="Actions Pending">Actions Pending</option>
        <option value="Closed">Closed</option>
      </select>
      <select className="form-input" value={typeFilter} onChange={(e) => onTypeChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Types</option>
        <option value="Internal">Internal</option>
        <option value="External">External</option>
        <option value="Client">Client</option>
        <option value="Regulatory">Regulatory</option>
      </select>
      <select className="form-input" value={siteFilter} onChange={(e) => onSiteChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Sites</option>
        {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}