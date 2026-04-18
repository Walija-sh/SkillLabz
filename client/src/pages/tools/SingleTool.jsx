import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toolService from '../../services/tool.service';
import Button from '../../components/common/Button';

export default function SingleTool() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await toolService.getToolById(id);
        setItem(response.item);
      } catch (err) {
        setError(err.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
        <p className="text-gray-500 mb-6">{error || 'Item not found.'}</p>
        <Button onClick={() => navigate('/explore')}>Back to Browse</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Results
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Column: Image Gallery */}
          <div className="p-6 lg:p-8 bg-gray-50 border-r border-gray-100">
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden bg-gray-200 mb-4 h-80 sm:h-96">
              <img 
                src={item.images[activeImage]?.url || 'https://via.placeholder.com/800x600?text=No+Image'} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.images.map((img, index) => (
                  <button 
                    key={img.public_id || index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="p-6 lg:p-8 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                {item.category}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
                {item.condition}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              {item.title}
            </h1>

            {/* Location */}
            <div className="flex items-center text-gray-500 text-sm mb-6 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5 text-gray-400">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
              {item.location?.city || 'Location not specified'} 
              {item.location?.addressText && ` • ${item.location.addressText}`}
            </div>

            {/* Price Box */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
              <div className="flex items-end mb-2">
                <span className="text-4xl font-black text-gray-900">Rs {item.pricePerDay}</span>
                <span className="text-gray-500 font-medium ml-2 mb-1">/ day</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Security Deposit: <span className="text-gray-900 font-bold">Rs {item.depositAmount}</span>
              </p>
            </div>

            {/* ✅ NEW: Skill Session Section */}
            {item.offerSkillSession && (
              <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl relative overflow-hidden group">
                {/* Decorative Icon Background */}
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                   </svg>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h4 className="text-blue-900 font-black uppercase text-xs tracking-widest">Skill Session Available</h4>
                  </div>
                  
                  <p className="text-blue-800/80 text-sm font-medium leading-relaxed mb-4">
                    {item.skillSessionDescription || `Learn how to use this tool properly from ${item.owner?.username}. Perfect for first-time users who want hands-on guidance.`}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-blue-200/50">
                    <span className="text-blue-900/60 text-[10px] font-black uppercase tracking-tighter">Additional Cost</span>
                    <span className="text-blue-600 font-black text-lg">Rs. {item.skillSessionPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8 flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Owner Info & Action Buttons */}
            <div className="mt-auto border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-200">
                    <img 
                      src={item.owner?.profileImage?.url || 'https://via.placeholder.com/150'} 
                      alt={item.owner?.username} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Listed by</p>
                    <Link to={`/users/${item.owner?._id}`} className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
                      {item.owner?.username}
                    </Link>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full py-4 bg-blue-600 text-white hover:bg-blue-700 text-lg font-black shadow-lg shadow-blue-200 transition-all rounded-xl"
                onClick={() => navigate(`/tools/${item._id}/rent`)}
              >
                Request to Rent
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}