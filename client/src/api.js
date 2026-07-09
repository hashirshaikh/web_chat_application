const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers = options.headers || {};

  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers
    }
  });
};

export const getSocketUrl = () => {
  return import.meta.env.VITE_API_URL || window.location.origin;
};
