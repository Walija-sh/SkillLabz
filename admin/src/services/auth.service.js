import api from './api';

// These should ideally be in your .env file, not plain text!
const ADMIN_EMAIL = "admin@skilllabz.com"; 
const ADMIN_PASS = "admin1234"; 

const login = async (email, password) => {
  // 1. Hardcoded check
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    // We still call the backend to get a real JWT token
    const response = await api.post('/auth/login', { email, password });

    if (response.data.data.user.role !== 'admin') {
      throw new Error("This account is not registered as an Admin in the database.");
    }

    localStorage.setItem('adminToken', response.data.token);
    localStorage.setItem('adminUser', JSON.stringify(response.data.data.user));
    return response.data;
  } else {
    throw new Error("Invalid Admin Credentials.");
  }
};

const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export default { login, logout };