import React from 'react';
import { brandColors, brandFonts, brandShadows } from '../theme/branding';

export const BrandGuide: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      color: brandColors.neutral.white,
      fontFamily: brandFonts.primary,
      background: brandColors.neutral.gray800,
      minHeight: '100vh',
      overflowY: 'auto'
    }}>
      <header style={{ marginBottom: '60px', borderBottom: `1px solid ${brandColors.neutral.gray800}` }}>
        <h1 style={{ 
          fontFamily: brandFonts.display, 
          fontSize: '3rem', 
          background: brandColors.gradient.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          Prism Brand Entity
        </h1>
        <p style={{ color: brandColors.neutral.gray200, maxWidth: '600px' }}>
          The official design system and brand identity documentation for Prism IPTV.
          Core values: Futuristic, Clear, Vibrant.
        </p>
      </header>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>01. Mascot Identity</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '40px',
          alignItems: 'center'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '40px', 
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: brandShadows.glass,
            textAlign: 'center'
          }}>
            <img 
              src="/brand/mascot/concept.png" 
              alt="Prism Mascot" 
              style={{ maxWidth: '100%', maxHeight: '400px', filter: 'drop-shadow(0 0 20px rgba(0,255,255,0.3))' }} 
            />
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '16px' }}>Meet "Lumen"</h3>
            <p style={{ lineHeight: '1.6', marginBottom: '24px', color: brandColors.neutral.gray200 }}>
              Lumen is the sentient core of the Prism ecosystem. A hovering geometric construct formed from 
              crystallized data, Lumen guides users through the entertainment spectrum.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
               <div style={{ background: '#000', padding: '20px', borderRadius: '12px' }}>
                  <img src="/brand/logo/logo-primary.svg" width="64" height="64" alt="Logo" />
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#888' }}>Primary Mark</p>
               </div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '60px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: brandColors.neutral.gray200 }}>Emotional Spectrum</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '24px' 
          }}>
            {[
              { name: 'Happy', src: '/brand/mascot/happy.png' },
              { name: 'Thinking', src: '/brand/mascot/thinking.png' },
              { name: 'Excited', src: '/brand/mascot/excited.png' },
              { name: 'Alert', src: '/brand/mascot/alert.png' },
              { name: 'Relaxed', src: '/brand/mascot/relaxed.png' },
            ].map((emotion) => (
              <div key={emotion.name} style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}>
                <img 
                  src={emotion.src} 
                  alt={emotion.name} 
                  style={{ width: '100%', height: 'auto', marginBottom: '12px', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                />
                <p style={{ fontWeight: 600, color: brandColors.primary.cyan }}>{emotion.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>02. Color System</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {Object.entries(brandColors.primary).map(([name, value]) => (
            <div key={name} style={{ background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '120px', background: value }}></div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{name}</p>
                <p style={{ fontSize: '0.9rem', color: '#666', fontFamily: 'monospace' }}>{value}</p>
              </div>
            </div>
          ))}
           <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '120px', background: brandColors.gradient.primary }}></div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontWeight: 'bold' }}>Primary Gradient</p>
                <p style={{ fontSize: '0.9rem', color: '#666', fontFamily: 'monospace' }}>CSS Gradients</p>
              </div>
            </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>03. Typography</h2>
        <div style={{ fontFamily: brandFonts.primary }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 700 }}>Heading 1</h1>
          <h2 style={{ fontSize: '3rem', fontWeight: 600 }}>Heading 2 (Display)</h2>
          <h3 style={{ fontSize: '2rem', fontWeight: 500 }}>Heading 3</h3>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', maxWidth: '60ch' }}>
            Body text should be readable and clear. The Prism interface uses Inter for UI elements to ensure
            legibility at small sizes, while using Outfit for headings to convey our futuristic character.
          </p>
        </div>
      </section>
    </div>
  );
};
