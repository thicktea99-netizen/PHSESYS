// src/components/equipment/EquipmentFilters.tsx

interface EquipmentFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  siteFilter: string;
  onSiteChange: (value: string) => void;
  sitesList: { id: string, name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function EquipmentFilters({ 
  statusFilter, onStatusChange, 
  siteFilter, onSiteChange, 
  sitesList, searchQuery, onSearchChange 
}: EquipmentFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search equipment by name or serial number..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Statuses</option>
        <option value="In Service">In Service</option>
        <option value="Damaged">Damaged</option>
        <option value="Under Repair">Under Repair</option>
        <option value="Retired">Retired</option>
      </select>
      <select className="form-input" value={siteFilter} onChange={(e) => onSiteChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Sites</option>
        {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}