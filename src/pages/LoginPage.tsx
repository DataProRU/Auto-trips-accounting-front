import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAppDispatch } from "@/hooks/hooks";
import { login } from "@/store/slices/authSlice";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { z } from "zod";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Имя пользователя обязательно")
    .refine((val) => val !== "null", {
      message: "Имя пользователя не может быть 'null'",
    }),
  password: z.string().min(1, "Пароль обязателен"),
});

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ username, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    try {
      const { access_token } = await authService.login({ username, password });
      dispatch(login({ username, access_token }));
      navigate(`/tg_bot_add?username=${username}`);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Ошибка авторизации",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3e9] flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={handleLogin}
        className="p-4 sm:p-6 bg-white rounded-lg shadow-md w-full max-w-[400px] sm:max-w-md"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Вход</h2>
        <div className="mb-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors((prev) => ({
                ...prev,
                username: undefined,
                general: undefined,
              }));
            }}
            placeholder="Имя пользователя"
            className="w-full text-sm sm:text-base"
          />
          {errors.username && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">
              {errors.username}
            </p>
          )}
        </div>
        <div className="mb-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({
                ...prev,
                password: undefined,
                general: undefined,
              }));
            }}
            placeholder="Пароль"
            className="w-full text-sm sm:text-base"
          />
          {errors.password && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">
              {errors.password}
            </p>
          )}
          {errors.general && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">
              {errors.general}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full text-sm sm:text-base">
          Войти
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
