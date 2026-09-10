import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (cookie exists) on app load
  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get("/users/profile");
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const register = async (formData) => {
    const { data } = await axiosInstance.post("/auth/register", formData);
    setUser(data);
    return data;
  };

  const login = async (formData) => {
    const { data } = await axiosInstance.post("/auth/login", formData);
    setUser(data);
    return data;
  };

  const logout = async () => {
    await axiosInstance.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout ,fetchProfile  }}>
      {children}
    </AuthContext.Provider>
  );
};