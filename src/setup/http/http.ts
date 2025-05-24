import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;
// export const API_URL = "http://localhost:8001";

export const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});
