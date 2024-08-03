import axios from "axios";

console.log(import.meta.env.VITE_REACT_APP_API_URL)

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL,
  withCredentials: true
});

export const signUp = (userData) => api.post("/auth/signup", userData);
export const signIn = (userData) => api.post("/auth/signin", userData);
export const getPresignedUrls = (numberOfUrls) =>
  api.post("/uploads/pre-url", { numberOfUrls });
export const putUserImages = (urls) => api.put("/uploads/put" , urls);
export const fetchUserImages = () => api.get("/uploads/images");
export const deleteImage = (key) =>
  api.delete("/uploads/image", { data: { key } });

export default api;
