import { useState, useEffect } from 'react';
import { loadFavicon } from '../utils/faviconUtils';

/**
 * Custom hook for loading domain favicons
 */
export const useFavicon = (domain: string) => {
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    const loadDomainFavicon = async () => {
      const faviconUrl = await loadFavicon(domain);
      setFavicon(faviconUrl);
    };

    loadDomainFavicon();
  }, [domain]);

  return favicon;
};