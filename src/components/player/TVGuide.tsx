import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Virtuoso } from 'react-virtuoso';
import styles from './TVGuide.module.css';
import { useEPGRequest, type Program } from '../../hooks/useEPGRequest';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { X, Clock, Tag } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const TVGuide: React.FC = () => {
  const { data, loading, error } = useEPGRequest();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [wikiInfo, setWikiInfo] = useState<{description: string, thumbnail?: string, url: string} | null>(null);

  React.useEffect(() => {
    if (selectedProgram) {
      // Clean title for search (remove season/episode patterns like S01E02)
      const cleanTitle = selectedProgram?.title ? selectedProgram.title.replace(/S\d+E\d+/i, '').replace(/\(.*\)/, '').trim() : '';
      
      if (cleanTitle) {
          import('../../services/iptv').then(({ IPTVService }) => {
             IPTVService.searchWiki(cleanTitle).then(info => {
               if (info) setWikiInfo(info);
             });
          });
      }
    } else {
      setWikiInfo(null);
    }
  }, [selectedProgram]);

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h2 className="mb-4 font-bold text-cyan-400 text-2xl">Guide</h2>
      <div style={{ height: 'calc(100% - 60px)' }}> {/* Adjust height for header */}
        <Virtuoso
          style={{ height: '100%' }}
          data={data.channels}
          itemContent={(_index, channel) => (
            <div key={channel.id} className={styles.channelRow}>
              <div className={styles.channelInfo}>
                <img src={channel.logo} alt={channel.name} className={styles.logo} loading="lazy" />
                <span>{channel.name}</span>
              </div>
              <div className={styles.programList}>
                {data?.programs[channel.id]?.map(program => (
                  <div 
                    key={program.id} 
                    className={styles.programCard} 
                    title={program.description}
                    onClick={() => {
                       console.log('Program clicked:', program.title);
                       setSelectedProgram(program);
                    }}
                  >
                    <div className={styles.programTitle}>{program.title}</div>
                    <div className={styles.programTime}>
                      {new Date(program.startTime).toLocaleTimeString([], {
                          hour: '2-digit', 
                          minute:'2-digit',
                          timeZone: useSettingsStore.getState().timeZone
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        />
      </div>

      {selectedProgram && createPortal(
        <div className={styles.modalOverlay} onClick={() => setSelectedProgram(null)} data-testid="program-modal-overlay">
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} data-testid="program-modal">
            <button className={styles.closeButton} onClick={() => setSelectedProgram(null)}>
              <X size={24} />
            </button>
            
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedProgram.title}</h3>
              <div className={styles.modalMeta}>
                <span className={styles.badge}>
                  <Clock size={14} className="mr-1" />
                  {new Date(selectedProgram.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {new Date(selectedProgram.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className={styles.badge}>
                  <Tag size={14} className="mr-1" />
                  {selectedProgram.category}
                </span>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className="flex gap-4">
                {wikiInfo?.thumbnail && (
                   <img src={wikiInfo.thumbnail} alt="Ref" className="shadow-md rounded w-32 h-auto object-cover" />
                )}
                <div className="flex-1">
                   <p className="mb-4 text-gray-300 text-sm leading-relaxed">
                     {wikiInfo?.description || selectedProgram.description || "No description available."}
                   </p>
                   {wikiInfo?.url && (
                     <a 
                       href={wikiInfo.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center mt-2 text-cyan-400 text-xs hover:underline"
                     >
                       Read more on Wikipedia
                     </a>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
