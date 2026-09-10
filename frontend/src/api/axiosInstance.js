import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // REQUIRED — sends/receives the httpOnly JWT cookie
});

export default axiosInstance;