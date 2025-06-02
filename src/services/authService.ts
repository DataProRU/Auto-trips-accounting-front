import { $api } from "@/setup/http/http";
import axios, { AxiosError } from "axios";

interface LoginResponse {
  access_token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}
export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await $api.post(
        `/login_react?username=${credentials.username}&password=${credentials.password}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error("Проверьте имя пользователя и пароль");
        }
        throw new Error(
          error.response.data.detail?.[0]?.msg || "Ошибка авторизации"
        );
      }
      throw new Error("Ошибка сети. Попробуйте снова.");
    }
  },
};

export const checkToken = async (token: string) => {
  try {
    return await $api.get(`/check_token?token=${token}`);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error("Unknown error occurred during token check");
  }
};
