import React from 'react';

interface BoltBadgeProps {
  className?: string;
}

export const BoltBadge = ({ className = "" }: BoltBadgeProps): JSX.Element => {
  const handleClick = () => {
    window.open('https://bolt.new/', '_blank', 'noopener,noreferrer');
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
        className="w-8 h-8 rounded-full"
      />
    </button>
  );
};