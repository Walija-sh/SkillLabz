import axios from 'axios';

const apiClient = axios.create({
    // Your live Vercel backend URL
    baseURL: 'https://skill-labz-backend.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT for secure routes
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;