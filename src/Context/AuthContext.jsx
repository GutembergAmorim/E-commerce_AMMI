import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // Verificar token na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          setLoading(true);
          const response = await authService.getMe();
          if (response.success) {
            setUser(response.data);
          } else {
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          authService.logout();
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.googleLogin(credential);
      if (response.success) {
        setUser(response.data);
      }
      return response;
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = { 
    user, 
    isAuthenticated, 
    login, 
    loginWithGoogle,
    logout, 
    register, 
    updateUser,
    loading, 
    error 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const  useAuth = () => {
  return useContext(AuthContext);
};