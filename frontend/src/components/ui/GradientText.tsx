import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'primary' | 'success' | 'warning' | 'error';
}

const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = '', 
  gradient = 'primary' 
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600',
    success: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
    warning: 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600',
    error: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600'
  };

  return (
    <span className={`${gradientClasses[gradient]} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;
