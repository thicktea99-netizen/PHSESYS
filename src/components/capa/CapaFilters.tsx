// src/components/capa/CapaFilters.tsx

interface CapaFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function CapaFilters({ 
  statusFilter, onStatusChange, 
  priorityFilter, onPriorityChange, 
  searchQuery, onSearchChange 
}: CapaFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search CAPA actions by title or owner..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Statuses</option>
        <option value="open">Open</option>
        <option value="in progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
      <select className="form-input" value={priorityFilter} onChange={(e) => onPriorityChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>
    </div>
  );
}