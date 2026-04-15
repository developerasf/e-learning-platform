import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PreloadContext = createContext();

export const usePreload = () => useContext(PreloadContext);

export const PreloadProvider = ({ children }) => {
  const [preloadedCourses, setPreloadedCourses] = useState(null);
  const [preloading, setPreloading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem('preloadedCourses');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          setPreloadedCourses(parsed.data);
        }
      } catch (e) {}
    }

    fetch('/api/courses?page=1&limit=6')
      .then(r => r.json())
      .then(data => {
        const courses = data.courses || data;
        const toPreload = courses.slice(0, 6);
        setPreloadedCourses(toPreload);
        localStorage.setItem('preloadedCourses', JSON.stringify({
          data: toPreload,
          timestamp: Date.now()
        }));
      })
      .catch(console.error)
      .finally(() => setPreloading(false));
  }, []);

  return (
    <PreloadContext.Provider value={{ preloadedCourses, preloading }}>
      {children}
    </PreloadContext.Provider>
  );
};