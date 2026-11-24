// src/components/sites/SiteFilters.tsx

interface SiteFiltersProps {
  projectFilter: string;
  onProjectChange: (value: string) => void;
  projectsList: { id: string, project_name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function SiteFilters({ 
  projectFilter, onProjectChange, 
  projectsList, searchQuery, onSearchChange 
}: SiteFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search sites by name or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={projectFilter} onChange={(e) => onProjectChange(e.target.value)} style={{ width: '250px' }}>
        <option value="All">All Projects</option>
        {projectsList.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
      </select>
    </div>
  );
}