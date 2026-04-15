const preloadedRoutes = new Set();

export const preloadRoute = (importFn) => {
  return importFn();
};

export const preloadOnIdle = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const { Home, Courses } = require('../pages');
      Home().then(() => preloadedRoutes.add('Home'));
      Courses().then(() => preloadedRoutes.add('Courses'));
    });
  } else {
    setTimeout(() => {
      const { Home, Courses } = require('../pages');
      Home().then(() => preloadedRoutes.add('Home'));
      Courses().then(() => preloadedRoutes.add('Courses'));
    }, 2000);
  }
};

export const isPreloaded = (routeName) => preloadedRoutes.has(routeName);

export default { preloadRoute, preloadOnIdle, isPreloaded };