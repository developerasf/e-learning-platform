import { createContext, useContext, useState, useEffect } from 'react';

const PreloadContext = createContext();

export const usePreload = () => useContext(PreloadContext);

// How long to trust the localStorage snapshot (3 minutes — matches server cache)
const PRELOAD_TTL = 3 * 60 * 1000;

export const PreloadProvider = ({ children }) => {
  const [preloadedCourses, setPreloadedCourses] = useState(null);
  const [preloading, setPreloading] = useState(true);

  useEffect(() => {
    // Try localStorage first — avoids an API call on every page load
    try {
      const cached = localStorage.getItem('preloadedCourses');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < PRELOAD_TTL) {
          setPreloadedCourses(parsed.data);
          setPreloading(false);
          return;
        }
      }
    } catch (e) {
      localStorage.removeItem('preloadedCourses');
    }

    // Fetch fresh — get 15 so Courses page can also use this data directly
    fetch('/api/courses?page=1&limit=15')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data) => {
        // Only set courses if we get a valid array response
        if (data && Array.isArray(data.courses)) {
          const courses = data.courses;
          localStorage.setItem(
            'preloadedCourses',
            JSON.stringify({ data: courses, timestamp: Date.now() })
          );
          setPreloadedCourses(courses);
        } else if (Array.isArray(data)) {
          // Fallback: data itself might be an array (older API format)
          localStorage.setItem(
            'preloadedCourses',
            JSON.stringify({ data, timestamp: Date.now() })
          );
          setPreloadedCourses(data);
        } else {
          // API returned error or non-array - don't cache it
          console.error('Invalid courses response:', data);
        }
      })
      .catch(console.error)
      .finally(() => setPreloading(false));
  }, []);

  // Call this after admin creates/edits a course to bust the preload cache
  const invalidatePreload = () => {
    localStorage.removeItem('preloadedCourses');
    setPreloadedCourses(null);
  };

  return (
    <PreloadContext.Provider value={{ preloadedCourses, preloading, invalidatePreload }}>
      {children}
    </PreloadContext.Provider>
  );
};
