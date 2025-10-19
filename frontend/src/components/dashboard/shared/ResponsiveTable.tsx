import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto mobile-scroll ${className}`} style={{ minWidth: '100%' }}>
      {children}
    </div>
  );
};

export default ResponsiveTable;
