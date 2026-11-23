// src/components/inductions/InductionFilters.tsx

interface InductionFiltersProps {
  siteFilter: string;
  onSiteChange: (value: string) => void;
  sitesList: { id: string, name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function InductionFilters({ 
  siteFilter, onSiteChange, 
  sitesList, searchQuery, onSearchChange 
}: InductionFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search inductions by person or company..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={siteFilter} onChange={(e) => onSiteChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Sites</option>
        {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}