// src/components/people/PeopleFilters.tsx

interface PeopleFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  contractorFilter: string;
  onContractorChange: (value: string) => void;
  contractorsList: { id: string, company_name: string }[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function PeopleFilters({ 
  statusFilter, onStatusChange, 
  contractorFilter, onContractorChange, 
  contractorsList, searchQuery, onSearchChange 
}: PeopleFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="search-box" style={{ flex: 1 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search people by name or role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="form-input" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} style={{ width: '180px' }}>
        <option value="All">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select className="form-input" value={contractorFilter} onChange={(e) => onContractorChange(e.target.value)} style={{ width: '200px' }}>
        <option value="All">All Contractors</option>
        {contractorsList.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
      </select>
    </div>
  );
}