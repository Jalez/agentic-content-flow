/**
 * Favicon loading utilities for REST nodes
 */

/**
 * Load favicon from domain with fallback handling
 */
export const loadFavicon = async (domain: string): Promise<string | null> => {
  if (!domain) return null;

  // Try to load favicon directly from the domain first
  const directFaviconUrl = `https://${domain}/favicon.ico`;
  
  try {
    const img = new Image();
    
    const loadPromise = new Promise<string>((resolve, reject) => {
      img.onload = () => {
        // Check if the image loaded successfully
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(directFaviconUrl);
        } else {
          reject('Invalid image');
        }
      };
      img.onerror = () => reject('Failed to load');
      
      // Set a timeout to avoid hanging
      setTimeout(() => reject('Timeout'), 3000);
    });

    img.src = directFaviconUrl;
    return await loadPromise;
  } catch {
    // If direct favicon fails, return null for fallback
    return null;
  }
};