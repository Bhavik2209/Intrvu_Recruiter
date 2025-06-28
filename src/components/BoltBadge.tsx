import React from 'react';

interface BoltBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BoltBadge = ({ className = "", size = 'md' }: BoltBadgeProps): JSX.Element => {
  const handleClick = () => {
    window.open('https://bolt.new/', '_blank', 'noopener,noreferrer');
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center hover:scale-105 transition-transform duration-200 ${className}`}
      title="Powered by Bolt.new"
      aria-label="Visit Bolt.new"
    >
      <img
        src="/black_circle_360x360.png"
        alt="Powered by Bolt.new"
        className={`${sizeClasses[size]} rounded-full`}
      />
    </button>
  );
};