export const apiUrl = (path: string) => {
  const baseUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}${path}` : path;
};

export const supabaseFunctionUrl = (name: string) => {
  const configuredUrl = String(import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '').replace(/\/$/, '');
  const projectUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const baseUrl = configuredUrl || (projectUrl ? `${projectUrl}/functions/v1` : '');
  return baseUrl ? `${baseUrl}/${name}` : '';
};
