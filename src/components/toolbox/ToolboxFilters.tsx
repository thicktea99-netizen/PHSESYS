// src/components/toolbox/ToolboxFilters.tsx

interface ToolboxFiltersProps {
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categoriesList: string[];
  siteFilter: string;
  onSiteChange: (value: string) => void;
  sitesList: { id: string, name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function ToolboxFilters({ 
  categoryFilter, onCategoryChange, categoriesList,
  siteFilter, onSiteChange, sitesList,
  searchQuery, onSearchChange 
}: ToolboxFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search toolbox talks by topic or presenter..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Categories</option>
        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <select className="form-input" value={siteFilter} onChange={(e) => onSiteChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Sites</option>
        {sitesList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  );
}