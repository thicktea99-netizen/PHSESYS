// src/pages/Documents.tsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DocumentStats from '../components/documents/DocumentStats';
import DocumentFilters from '../components/documents/DocumentFilters';
import DocumentList from '../components/documents/DocumentList';
import '../styles/Incidents.css';
import '../styles/Documents.css';

interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_type: string;
  is_pinned: boolean;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('documents').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      alert("Error fetching documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleTogglePin = async (id: string, current: boolean) => {
    await supabase.from('documents').update({ is_pinned: !current }).eq('id', id);
    setDocuments(documents.map(d => d.id === id ? { ...d, is_pinned: !current } : d));
  };

  // Filter logic
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Stats
  const categoriesList = Array.from(new Set(documents.map(d => d.category)));
  const pinned = documents.filter(d => d.is_pinned).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Document Library</h1>
          <p className="page-subtitle">Your filing cabinet for policies, procedures, and templates.</p>
        </div>
        <Link to="/documents/new" className="btn-primary"><Plus size={18} /> Upload Document</Link>
      </div>

      <DocumentStats total={documents.length} pinned={pinned} categories={categoriesList.length} />

      <DocumentFilters 
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoriesList={categoriesList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <DocumentList 
        documents={filteredDocuments}
        loading={loading}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}