/**
 * URL parsing utilities for REST nodes
 */

export interface UrlParts {
  domain: string;
  pathWithQuery: string;
}

/**
 * Extract domain and path from URL
 */
export const getUrlParts = (url: string): UrlParts => {
  try {
    if (!url) return { domain: '', pathWithQuery: '' };
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const pathWithQuery = urlObj.pathname + urlObj.search + urlObj.hash;
    
    return { domain, pathWithQuery: pathWithQuery || '/' };
  } catch {
    // If URL is invalid, treat as path only
    return { domain: '', pathWithQuery: url };
  }
};