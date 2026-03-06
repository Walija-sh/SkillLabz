import React, { forwardRef, useId } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  className = '',
  error = '',
  placeholder = '',
  ...props
}, ref) => {
  const inputId = useId();

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 bg-white text-gray-900 border rounded-lg outline-none transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;