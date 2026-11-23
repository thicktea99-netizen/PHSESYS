// src/components/risk/RiskFilters.tsx

interface RiskFiltersProps {
  typeFilter: string;
  onTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  siteFilter: string;
  onSiteChange: (value: string) => void;
  sitesList: { id: string, name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function RiskFilters({ 
  typeFilter, onTypeChange, 
  statusFilter, onStatusChange,
  siteFilter, onSiteChange, sitesList,
  searchQuery, onSearchChange 
}: RiskFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search assessments by task name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={typeFilter} onChange={(e) => onTypeChange(e.target.value)} style={{ width: '150px' }}>
        <option value="All">All Types</option>
        <option value="JSA">JSA</option>
        <option value="RAMS">RAMS</option>
      </select>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '150px' }}>
        <option value="All">All Statuses</option>
        <option value="Draft">Draft</option>
        <option value="Approved">Approved</option>
        <option value="Expired">Expired</option>
      </select>
      <select className="form-input" value={siteFilter} onChange={(e) => onSiteChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Sites</option>
        {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}