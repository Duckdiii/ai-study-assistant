import { createContext, useContext, useEffect, useState } from "react";
import { mockGetMe, mockLogin, mockLogout } from "../mock/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    mockGetMe().then((u) => setUser(u)).finally(() => setBooting(false));
  }, []);

  const login = async (email) => {
    const u = await mockLogin(email);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await mockLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
