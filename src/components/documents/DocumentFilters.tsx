// src/components/documents/DocumentFilters.tsx

interface DocumentFiltersProps {
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categoriesList: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function DocumentFilters({ 
  categoryFilter, onCategoryChange, 
  categoriesList, searchQuery, onSearchChange 
}: DocumentFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search documents by title, description, or tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} style={{ width: '220px' }}>
        <option value="All">All Categories</option>
        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
    </div>
  );
}