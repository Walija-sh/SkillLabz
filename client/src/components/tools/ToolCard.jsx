import React from 'react';
import { Link } from 'react-router-dom';

export default function ToolCard({ item }) {
  return (
    <Link 
      to={`/tools/${item._id}`} 
      className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all overflow-hidden flex flex-col relative"
    >
      {/* Image Container - Height reduced for mobile (h-32) */}
      <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
        <img 
          src={item.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content Container - Padding reduced for mobile (p-3) */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <div className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
          {item.category?.replace('_', ' ')}
        </div>
        
        {/* Title - Text size reduced for mobile (text-sm) */}
        <h3 className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-1 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
          {item.title}
        </h3>
        
        {/* Location - Icon and text scaled down */}
        <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-sm mb-3 sm:mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-gray-400">
            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
          </svg>
          <span className="truncate font-medium">{item.location?.city || 'Location N/A'}</span>
        </div>
        
        {/* Footer: Price & Owner Avatar */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-50 flex justify-between items-center">
          <div>
            <span className="text-sm sm:text-xl font-black text-gray-900">Rs {item.pricePerDay}</span>
            <span className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-tighter ml-0.5 sm:ml-1">/ day</span>
          </div>
          
          {/* Avatar - Scaled down for mobile */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0">
            <img 
              src={item.owner?.profileImage?.url || 'https://via.placeholder.com/40'} 
              alt={item.owner?.username} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </Link>
  );
}