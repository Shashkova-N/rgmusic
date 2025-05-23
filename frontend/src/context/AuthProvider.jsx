import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    user: null,
    role: null,
    token: null,
    userId: null,
  });

  // При монтировании — пробуем восстановить сессию
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');

    if (token && userId && storedRole) {
      setAuth({
        user: email,
        role: storedRole,
        token,
        userId,
      });
    }
  }, []);

  const signIn = ({ user, role, token, userId }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', user);   // просто для отображения
    localStorage.setItem('userRole', role);     // сохраняем роль

    setAuth({ user, role, token, userId });
  };

  const signOut = () => {
    localStorage.clear();
    setAuth({ user: null, role: null, token: null, userId: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}