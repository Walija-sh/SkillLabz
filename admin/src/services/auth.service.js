import api from './api';

const login = async (email, password) => {
  // Normal login request
  const response = await api.post('/auth/login', { email, password });
 
  const user = response.data.data;
  if (user.role !== 'admin') {
    throw new Error("Access denied. Admin account required.");
  }

  // Separate token from user data
  const { token, ...userData } = user;
  
  if (!token) {
    throw new Error("No authentication token received from server");
  }

  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(userData));

  return response.data;
};

const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

export default { login, logout };