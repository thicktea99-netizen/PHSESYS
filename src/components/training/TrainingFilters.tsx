// src/components/training/TrainingFilters.tsx

interface TrainingFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function TrainingFilters({ 
  statusFilter, onStatusChange, 
  searchQuery, onSearchChange 
}: TrainingFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search certifications by person or type..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Statuses</option>
        <option value="valid">Valid</option>
        <option value="expiring">Expiring Soon</option>
        <option value="expired">Expired</option>
      </select>
    </div>
  );
}