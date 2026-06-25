import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Redesigned: clean white card instead of neumorphic
const NeumorphicBox = ({ children, className, inset = false }) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface border border-border transition-all duration-200',
        inset ? 'shadow-none bg-background' : 'shadow-card',
        className
      )}
    >
      {children}
    </div>
  );
};

export default NeumorphicBox;
