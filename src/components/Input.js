import React from 'react';

function Input({ type = 'text', value, onChange, placeholder = '', className = '', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring focus:border-blue-300 ${className}`}
      {...props}
    />
  );
}

export default Input;
