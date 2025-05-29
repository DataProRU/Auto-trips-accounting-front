import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAppDispatch } from "@/hooks/hooks";
import { login } from "@/store/slices/authSlice";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username === "null" || !password) {
      setError("Введите валидные имя пользователя и пароль");
      return;
    }
    try {
      const { access_token } = await authService.login({ username, password });
      dispatch(login({ username, access_token }));
      navigate(`/tg_bot_add?username=${username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
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
              setError("");
            }}
            placeholder="Имя пользователя"
            className="w-full text-sm sm:text-base"
          />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Пароль"
            className="w-full text-sm sm:text-base"
          />
          {error && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">{error}</p>
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
