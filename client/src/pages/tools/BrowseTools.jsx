import React, { useState, useEffect } from 'react';
import toolService from '../../services/tool.service';
import Button from '../../components/common/Button';
import ToolCard from '../../components/tools/ToolCard';
import ToolFilters from '../../components/tools/ToolFilters';

export default function BrowseTools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    keyword: '', category: '', city: '', minPrice: '', maxPrice: '',
    page: 1, limit: 12, lat: null, lng: null, distance: 10
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(appliedFilters).filter(([_, v]) => v !== null && v !== '')
        );

        if (activeFilters.city) {
          activeFilters.city = activeFilters.city.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
        }

        const response = await (activeFilters.lat && activeFilters.lng 
          ? toolService.getNearbyTools(activeFilters) 
          : toolService.getAllTools(activeFilters));

        setItems(response.items || []);
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.total || 0,
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationUpdate = (coords) => {
    const newFilters = { ...filters, ...coords, page: 1 };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  const handleApplyFilters = () => setAppliedFilters({ ...filters, page: 1 });

  const handleClearFilters = () => {
    const reset = { keyword: '', category: '', city: '', minPrice: '', maxPrice: '', page: 1, limit: 12, lat: null, lng: null, distance: 10 };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      setAppliedFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleApplyFilters(); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-end">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Marketplace</h1>
        <div className="w-full md:w-96 relative group">
          <input
            type="text"
            name="keyword"
            placeholder="Search gear..."
            value={filters.keyword}
            onChange={handleFilterChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-white focus:border-blue-600 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <ToolFilters 
          filters={filters} onFilterChange={handleFilterChange} onApply={handleApplyFilters}
          onClear={handleClearFilters} onKeyDown={handleKeyDown} onLocationFetch={handleLocationUpdate}
        />

        <div className="flex-1">
          {error && <div className="bg-red-50 text-red-700 p-5 rounded-2xl mb-8 border border-red-100 font-bold">{error}</div>}

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="animate-pulse bg-gray-50 rounded-3xl h-80 border border-gray-100"></div>
               ))}
             </div>
          ) : items.length === 0 ? (
            <div className="bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 p-20 text-center">
               <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No gear listed here yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-8">
              {items.map(item => <ToolCard key={item._id} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}