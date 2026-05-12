import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (user) {
      setAdmin(JSON.parse(user));
    }
  }, []);

  return { admin, isAuthenticated: !!admin };
};