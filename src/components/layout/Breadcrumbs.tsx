import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import styles from './Breadcrumbs.module.css';

export const Breadcrumbs: React.FC = () => {
  const { mode } = useAppStore();

  const getBreadcrumbs = () => {
    const paths = [{ label: 'Home', id: 'home' }];
    
    switch (mode) {
      case 'tv':
        paths.push({ label: 'Live TV', id: 'tv' });
        break;
      case 'sports':
        paths.push({ label: 'Sports', id: 'sports' });
        break;
      case 'favorites':
        paths.push({ label: 'My Favorites', id: 'favorites' });
        break;
      case 'settings':
        paths.push({ label: 'Settings', id: 'settings' });
        break;
      default:
        break;
    }
    return paths;
  };

  const crumbs = getBreadcrumbs();

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => (
          <li key={crumb.id} className={styles.item}>
            {index > 0 && <ChevronRight size={14} className={styles.separator} />}
            <span 
              className={styles.label} 
              aria-current={index === crumbs.length - 1 ? 'page' : undefined}
            >
              {crumb.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};
