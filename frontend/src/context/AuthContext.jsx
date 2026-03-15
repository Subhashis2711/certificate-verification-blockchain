import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

// Simulated user storage (in production, this would be a backend API)
const USERS_KEY = 'certchain_users';
const CURRENT_USER_KEY = 'certchain_current_user';

const getStoredUsers = () => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveStoredUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (email, password, organizationName, role) => {
    const users = getStoredUsers();

    if (users.some(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      organizationName,
      organizationId: crypto.randomUUID(),
      role,
    };

    users.push(newUser);
    saveStoredUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
