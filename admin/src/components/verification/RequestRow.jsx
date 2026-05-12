const RequestRow = ({ request, onReview }) => (
  <tr className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
          {request.user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{request.user?.username}</div>
          <div className="text-xs text-gray-500">{request.user?.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-700">
      {request.fullName}
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">
      {request.cnicNumber}
    </td>
    <td className="px-6 py-4 text-right">
      <button 
        onClick={() => onReview(request)}
        className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
      >
        Review
      </button>
    </td>
  </tr>
);

export default RequestRow;