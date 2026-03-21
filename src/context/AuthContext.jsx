import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Basic JWT decode to extract payload without external libraries
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('ppm_id_token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if we are returning from Cognito Hosted UI
    const hash = window.location.hash;
    if (hash && hash.includes('id_token=')) {
      const params = new URLSearchParams(hash.substring(1)); // remove '#'
      const idToken = params.get('id_token');
      
      if (idToken) {
        setToken(idToken);
        localStorage.setItem('ppm_id_token', idToken);
        // Clean up URL hash so it doesn't stay in the navigation bar
        window.history.replaceState(null, null, ' ');
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser({ email: decoded.email, exp: decoded.exp });
      } else {
        // Invalid token
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = () => {
    // Redirect to Cognito Hosted UI
    const COGNITO_DOMAIN = 'https://ap-south-1rkioea58l.auth.ap-south-1.amazoncognito.com';
    const CLIENT_ID = '2r45m04ssdklbout3uhctq62bf';
    const REDIRECT_URI = 'http://localhost:5173/';
    
    window.location.href = `${COGNITO_DOMAIN}/login?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ppm_id_token');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
