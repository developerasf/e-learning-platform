// Per-URL TTL cache — separates public data (safe to cache longer) from
// user-specific data (must stay real-time).
//
// TTL rules:
//   courses list       → 3 minutes  (public, changes rarely)
//   course detail      → 5 minutes  (public, changes rarely)
//   my-courses         → NO cache   (must reflect latest enrollment status)
//   enrollment-status  → NO cache   (must reflect latest status)
//   user profile       → NO cache   (must reflect latest user data)
//   admin routes       → NO cache   (admin needs real-time data)
//
// Always call clearCache(url) after any mutation (enroll, unenroll, update).

const apiCache = new Map();

// Default TTLs in milliseconds by URL pattern
const getTTL = (url) => {
  if (url.includes('/my-courses')) return 0;
  if (url.includes('/enrollment-status')) return 0;
  if (url.includes('/profile')) return 0;
  if (url.includes('/admin')) return 0;
  if (url.includes('/api/users')) return 0;
  if (url.includes('/api/courses?')) return 3 * 60 * 1000;  // 3 min for course list
  if (url.match(/\/api\/courses\/[^/]+$/)) return 5 * 60 * 1000; // 5 min for course detail
  return 0; // default: no cache for anything not explicitly listed
};

export const fetchWithCache = async (url, options = {}, ttlOverride = null) => {
  const ttl = ttlOverride !== null ? ttlOverride : getTTL(url);

  // Skip cache entirely for 0 TTL or mutating requests
  if (ttl === 0 || (['POST','PUT','DELETE','PATCH'].includes(options.method))) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

// Clear all entries matching a pattern (e.g. clear all course list pages after enroll)
export const clearCachePattern = (pattern) => {
  for (const key of apiCache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

export default { fetchWithCache, clearCache, clearCachePattern };
