import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, accessToken, refreshToken) => {
    // Estandarización de claves para que toda la app las reconozca por igual
    localStorage.setItem('token', accessToken);
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('username', userData.username);
    localStorage.setItem('rol', userData.rol);

    setUser(userData);
    setToken(accessToken);
  };



  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
