import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = 'https://hamza-developer-speckitplus-backend.hf.space';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('pai_token');
    const savedUser  = localStorage.getItem('pai_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Signup failed');
    _saveSession(data.token, data.user);
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    _saveSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pai_token');
    localStorage.removeItem('pai_user');
    setToken(null);
    setUser(null);
  };

  const authFetch = async (path, options = {}) => {
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  };

  const _saveSession = (tok, usr) => {
    localStorage.setItem('pai_token', tok);
    localStorage.setItem('pai_user',  JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, authFetch, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
