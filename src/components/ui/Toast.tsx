import React from 'react';
import clsx from 'clsx';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = {
  id: string;
  title: string;
  description?: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
};
  
const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
};

export const Toast: React.FC<ToastType> = ({ id, title, description, variant }) => {
  const Icon = icons[variant];
  
  return (
    <div className={clsx(styles.toast, styles[variant])} role="alert" data-toast-id={id}>
      <Icon className={styles.icon} size={20} />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
    </div>
  );
};
