// lib/api-service.ts
import { useError } from './error-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiService = () => {
  const { handleApiError } = useError();

  const request = async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => request(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    put: (endpoint: string, data: any) => request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    patch: (endpoint: string, data: any) => request(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
    upload: (endpoint: string, formData: FormData) => {
      return request(endpoint, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
  };
};

export default apiService;