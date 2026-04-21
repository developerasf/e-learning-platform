export const getPath = (url) => {
  if (!url) return '/';
  let path = url.split('?')[0];
  if (path.startsWith('/api/auth')) {
    path = path.substring(9);
  } else if (path.startsWith('/api/courses')) {
    path = path.substring(12);
  } else if (path.startsWith('/api/users')) {
    path = path.substring(10);
  } else if (path.startsWith('/api/payments')) {
    path = path.substring(13);
  } else if (path.startsWith('/api')) {
    path = path.substring(4);
  }
  return path || '/';
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().substring(0, 500);
  }
  return input;
};

export const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};