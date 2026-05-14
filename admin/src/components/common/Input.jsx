const Input = ({ label, type = "text", value, onChange, placeholder, error, className = "" }) => (
  <div className={`w-full ${className}`}>
    {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
  </div>
);

export default Input;