import React, { createContext, useContext, useState, useEffect } from "react";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authority, setAuthority] = useState(() => {
    try { return JSON.parse(localStorage.getItem("civix_authority")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("civix_token") || null);

  const login = (tokenVal, authorityData) => {
    localStorage.setItem("civix_token", tokenVal);
    localStorage.setItem("civix_authority", JSON.stringify(authorityData));
    setToken(tokenVal);
    setAuthority(authorityData);
  };

  const logout = () => {
    localStorage.removeItem("civix_token");
    localStorage.removeItem("civix_authority");
    setToken(null);
    setAuthority(null);
  };

  return (
    <AuthCtx.Provider value={{ authority, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
