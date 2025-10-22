import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Only this div should scroll horizontally */}
      <div className="overflow-x-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveTable;