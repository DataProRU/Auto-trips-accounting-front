import { $api } from "@/setup/http/http";
import axios, { AxiosError } from "axios";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  username: string;
}

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface VerifyResponse {
  valid: boolean;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await $api.post(
        `/login_react`,
        {
          username: credentials.username,
          password: credentials.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token, refresh_token, username } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("username", username);
      document.cookie = `refresh_token=${refresh_token}; path=/;`;
      document.cookie = `token=${access_token}; path=/;`;

      return { access_token, refresh_token, username };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error("Проверьте имя пользователя и пароль");
        }
        if (
          error.response.data.detail &&
          Array.isArray(error.response.data.detail)
        ) {
          const errorMessages = error.response.data.detail
            .map((err: { msg: string }) => err.msg)
            .filter(Boolean);
          throw new Error(errorMessages.join(", ") || "Ошибка авторизации");
        }
        throw new Error(
          error.response.data.detail?.[0]?.msg || "Ошибка авторизации"
        );
      }
      throw new Error("Ошибка сети. Попробуйте снова.");
    }
  },

  verify: async (token: string): Promise<VerifyResponse> => {
    try {
      const response = await $api.post("/verify", { access_token: token });
      console.log("Verify response:", response.data);
      const isValid = response.data.status === "ok";
      console.log("Is valid:", isValid);
      return { valid: isValid };
    } catch (error) {
      console.log("Verify error:", error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          return { valid: false };
        }
        throw new Error("Ошибка проверки токена");
      }
      throw new Error("Ошибка сети при проверке токена");
    }
  },

  refresh: async (): Promise<RefreshResponse> => {
    try {
      const response = await $api.post("/refresh");
      const { access_token, refresh_token } = response.data;
      localStorage.setItem("access_token", access_token);
      document.cookie = `token=${access_token}; path=/;`;
      if (refresh_token) {
        document.cookie = `refresh_token=${refresh_token}; path=/;`;
      }
      return { access_token, refresh_token };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error("Не удалось обновить токен");
        }
        throw new Error("Ошибка обновления токена");
      }
      throw new Error("Ошибка сети при обновлении токена");
    }
  },
};

export const checkToken = async (token: string) => {
  try {
    return await authService.verify(token);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw new Error("Unknown error occurred during token check");
  }
};
