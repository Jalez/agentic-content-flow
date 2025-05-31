import React from 'react';

/**
 * Domain icon configuration and generation utilities
 */

export interface DomainIconConfig {
  icon: React.ReactNode;
  color: string;
}

/**
 * Get custom icon for known domains
 */
export const getDomainIcon = (domain: string): DomainIconConfig | null => {
  const lowerDomain = domain.toLowerCase();
  
  // Use simpler, CSS-based icons for crisp rendering
  if (lowerDomain.includes('github')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
          G
        </div>
      ),
      color: 'text-gray-900'
    };
  }
  
  if (lowerDomain.includes('google')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          G
        </div>
      ),
      color: 'text-blue-600'
    };
  }
  
  if (lowerDomain.includes('stripe')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg">
          S
        </div>
      ),
      color: 'text-indigo-600'
    };
  }
  
  if (lowerDomain.includes('api') || lowerDomain.includes('rest')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-lg">
          ⚡
        </div>
      ),
      color: 'text-orange-600'
    };
  }
  
  if (lowerDomain.includes('json')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-lg">
          { }
        </div>
      ),
      color: 'text-yellow-600'
    };
  }

  if (lowerDomain.includes('twitter') || lowerDomain.includes('x.com')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
          𝕏
        </div>
      ),
      color: 'text-black'
    };
  }

  if (lowerDomain.includes('facebook') || lowerDomain.includes('meta')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">
          f
        </div>
      ),
      color: 'text-blue-600'
    };
  }

  if (lowerDomain.includes('linkedin')) {
    return { 
      icon: (
        <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-lg">
          in
        </div>
      ),
      color: 'text-blue-700'
    };
  }
  
  return null;
};

/**
 * Generate a deterministic color based on domain
 */
export const getDomainColor = (domain: string): string => {
  const colors = [
    'text-blue-600', 'text-green-600', 'text-purple-600', 'text-red-600',
    'text-orange-600', 'text-pink-600', 'text-indigo-600', 'text-teal-600'
  ];
  
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    const char = domain.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};