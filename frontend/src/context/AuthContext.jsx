import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (token && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    // Only block with loading if we have a token but haven't loaded the user object yet
    return Boolean(token && !savedUser);
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      localStorage.removeItem("user");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axiosInstance.get("/users/profile");
      const fullUser = { ...(typeof data === "object" ? data : {}), token };
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));
    } catch (error) {
      // Only clear if 401 Unauthorized (token actually expired or invalid)
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
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
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const login = async (formData) => {
    const { data } = await axiosInstance.post("/auth/login", formData);
    if (data.token) localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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

  const changePassword = async (passwordData) => {
    const { data } = await axiosInstance.put("/users/change-password", passwordData);
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
        changePassword,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};