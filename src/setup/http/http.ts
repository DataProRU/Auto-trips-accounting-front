import axios from "axios";

// export const API_URL = import.meta.env.VITE_API_URL;
export const API_URL = "http://localhost:8000";

export const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

// Добавляем токен к каждому запросу
$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обрабатываем ответы и ошибки
$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если получили 401 и это не повторный запрос
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("access_token")
    ) {
      originalRequest._retry = true;

      try {
        // Пробуем обновить токен
        const response = await axios.post(`${API_URL}/refresh`, {}, {
          withCredentials: true,
        });

        const newToken = response.data.access_token;
        localStorage.setItem("access_token", newToken);

        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return $api(originalRequest);
      } catch (refreshError) {
        // Если обновление не удалось, очищаем токен и редиректим
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        window.location.href = "/tg_bot_add";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default $api;
