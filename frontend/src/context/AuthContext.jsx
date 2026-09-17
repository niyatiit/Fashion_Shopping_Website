import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (data.token) localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const login = async (formData) => {
    const { data } = await axiosInstance.post("/auth/login", formData);
    if (data.token) localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    const { data } = await axiosInstance.post("/auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (token, password, confirmPassword) => {
    const { data } = await axiosInstance.put(`/auth/reset-password/${token}`, {
      password,
      confirmPassword,
    });
    return data;
  };

  const verifyEmail = async (token) => {
    const { data } = await axiosInstance.get(`/auth/verify-email/${token}`);
    await fetchProfile();
    return data;
  };

  const resendVerification = async () => {
    const { data } = await axiosInstance.post("/auth/resend-verification");
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        fetchProfile,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};