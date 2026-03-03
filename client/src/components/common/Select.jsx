import React, { forwardRef, useId } from 'react';

const Select = forwardRef(({
  options = [],
  label,
  className = '',
  error = '',
  ...props
}, ref) => {
  const selectId = useId();

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`w-full px-4 py-2 bg-white text-gray-900 border rounded-lg outline-none transition-colors duration-200 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}
          ${className}
        `}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;