import axios from 'axios';

const API_BASE_URL = 'https://95gsox7z4b.execute-api.ap-south-1.amazonaws.com';

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ppm_id_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      throw new AuthError('Session expired or invalid token. Please log in again.');
    }
    throw error;
  }
);

export const getPasswords = async () => {
  try {
    const response = await apiClient.get('/get-passwords');
    return response.data;
  } catch (error) {
    if (error.name === 'AuthError') throw error;
    throw new Error(error.response?.data?.message || 'Failed to fetch passwords');
  }
};

export const addPassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/add-password', passwordData);
    return response.data;
  } catch (error) {
    if (error.name === 'AuthError') throw error;
    throw new Error(error.response?.data?.message || 'Failed to add password');
  }
};

export const deletePassword = async (site) => {
  try {
    // Axios DELETE with body requires the 'data' property
    const response = await apiClient.delete('/delete-password', {
      data: { site }
    });
    return response.data;
  } catch (error) {
    if (error.name === 'AuthError') throw error;
    throw new Error(error.response?.data?.message || 'Failed to delete password');
  }
};

export const updatePassword = async (data) => {
  try {
    const response = await apiClient.put('/update-password', data);
    return response.data;
  } catch (error) {
    if (error.name === 'AuthError') throw error;
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};
