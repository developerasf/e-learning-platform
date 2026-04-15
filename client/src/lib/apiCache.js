const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchWithCache = async (url, options = {}) => {
  const cached = apiCache.get(url);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  apiCache.set(url, { data, timestamp: Date.now() });
  
  return data;
};

export const clearCache = (url = null) => {
  if (url) {
    apiCache.delete(url);
  } else {
    apiCache.clear();
  }
};

export default { fetchWithCache, clearCache };
