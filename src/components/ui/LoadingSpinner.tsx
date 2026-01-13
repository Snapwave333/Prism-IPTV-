import React from 'react';
import clsx from 'clsx';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  overlay = false 
}) => {
  const spinner = (
    <div className={clsx(styles.spinner, styles[size], className)} />
  );

  if (overlay) {
    return (
      <div className={styles.overlay}>
        {spinner}
      </div>
    );
  }

  return spinner;
};
