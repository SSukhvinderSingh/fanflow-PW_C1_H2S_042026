import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const mockSignInWithGoogle = async () => {
    setUser({ uid: "mock-user-123", displayName: "FanFlow Guest", email: "guest@fanflow.com", photoURL: "" });
  };

  const mockLogout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, signInWithGoogle: mockSignInWithGoogle, logout: mockLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
