import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // Add timeout
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Since you're not using tokens, no need to set Authorization
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout - please try again'));
    }
    
    if (!error.response) {
      return Promise.reject(new Error('Network error - please check your connection'));
    }

    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 400:
          // You might want to handle 400 errors separately if needed
          break;
        case 401:
          // Do nothing here—do NOT remove localStorage items.
          // If your backend returns 401 for unauthenticated requests,
          // you can log it but avoid clearing the role.
          console.error('Received 401 response, but not clearing localStorage because tokens are not used.');
          break;
        default:
          console.error('Server Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

// Remove the interceptors for setting X-User-Email if desired or leave them if your backend requires them.
axiosInstance.interceptors.request.use((config) => {
  const role = localStorage.getItem('role');
  if (role === 'INSTRUCTOR') {
    const email = localStorage.getItem('email');
    config.headers['X-User-Email'] = email;
  }
  return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (role === 'STUDENT' && email) {
      config.headers['X-User-Email'] = email;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
