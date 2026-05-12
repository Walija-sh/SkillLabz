const Table = ({ headers, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          {headers.map((header, index) => (
            <th key={index} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {children}
      </tbody>
    </table>
  </div>
);

export default Table;