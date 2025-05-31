import React from 'react';
import { Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDomainIcon, getDomainColor } from '../utils/domainIconUtils';

/**
 * Domain icon display component
 */
interface DomainIconProps {
  domain: string;
  favicon: string | null;
}

export const DomainIcon: React.FC<DomainIconProps> = ({ domain, favicon }) => {
  if (favicon) {
    return (
      <img 
        src={favicon} 
        alt={`${domain} favicon`}
        className="w-12 h-12"
        style={{
          imageRendering: 'pixelated'
        }}
        title={domain}
      />
    );
  }
  
  if (domain) {
    const domainIcon = getDomainIcon(domain);
    if (domainIcon) {
      return (
        <div 
          className={cn("w-12 h-12 rounded-lg flex items-center justify-center", domainIcon.color)}
          title={domain}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {domainIcon.icon}
          </div>
        </div>
      );
    }
    
    // Fallback to styled letter with deterministic color
    const domainColor = getDomainColor(domain);
    return (
      <div 
        className={cn("w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-lg font-semibold", domainColor)}
        title={domain}
        style={{
          fontFeatureSettings: '"liga" off',
          textRendering: 'geometricPrecision',
          WebkitFontSmoothing: 'antialiased'
        }}
      >
        {domain.charAt(0).toUpperCase()}
      </div>
    );
  }
  
  return (
    <div 
      className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center"
      title="No endpoint configured"
    >
      <Globe2 className="w-6 h-6 text-slate-400" />
    </div>
  );
};