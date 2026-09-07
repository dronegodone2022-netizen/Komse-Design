export const apiUrl = (path: string) => {
  const baseUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}${path}` : path;
};
