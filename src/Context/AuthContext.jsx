import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Tenta carregar o usuário do localStorage ao iniciar
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Falha ao carregar usuário do localStorage", error);
      return null;
    }
  });

  // O estado de autenticação é derivado do estado do usuário
  const isAuthenticated = !!user; // Verifica se o usuário está autenticado

  // Efeito para salvar o usuário no localStorage sempre que ele mudar
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("currentUser");
      }
    } catch (error) {
      console.error("Falha ao salvar usuário no localStorage", error);
    }
  }, [user]);

  // Função para obter todos os usuários do "banco de dados" do localStorage
  const getUsersFromStorage = () => {
    try {
      const users = localStorage.getItem("users");
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error("Falha ao carregar usuários do localStorage", error);
      return [];
    }
  };

  // Funções de registro
  const register = (userData) => {
    const users = getUsersFromStorage();
    const userExists = users.some((u) => u.email === userData.email);

    if (userExists) {
      return { success: false, message: "Este e-mail já está cadastrado." };
    }

    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));
    return { success: true, message: "Cadastro realizado com sucesso!" };
  };

  const login = (email, password) => {
    const users = getUsersFromStorage();
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      // Armazena apenas os dados necessários para a sessão, sem a senha
      const { password, ...userToStore } = foundUser;
      setUser(userToStore);
      return { success: true}; // Sucesso no login
    }
    return { success: false, message: "Credenciais inválidas." }; // Falha no login
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, isAuthenticated, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};