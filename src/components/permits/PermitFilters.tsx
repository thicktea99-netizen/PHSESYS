// src/components/permits/PermitFilters.tsx

interface PermitFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  siteFilter: string;
  onSiteChange: (value: string) => void;
  sitesList: { id: string, name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function PermitFilters({ 
  statusFilter, onStatusChange, 
  siteFilter, onSiteChange, 
  sitesList, searchQuery, onSearchChange 
}: PermitFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search permits by work description or receiver..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Suspended">Suspended</option>
        <option value="Cancelled">Cancelled</option>
        <option value="Closed">Closed</option>
      </select>
      <select className="form-input" value={siteFilter} onChange={(e) => onSiteChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Sites</option>
        {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}