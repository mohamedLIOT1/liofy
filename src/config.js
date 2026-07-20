/**
 * Central API & Backend Configuration
 */

// Production Railway API URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://liofy-production.up.railway.app';

export const getApiUrl = (endpoint) => {
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${base}/${path}`;
};
