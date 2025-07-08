import { useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "./hooks/hooks";
import { logout, verifyToken, refreshToken } from "./store/slices/authSlice";
import type { AppDispatch } from "./store/store";
import {
  selectIsAuthenticated,
  selectUsername,
  selectAuthLoading,
  selectAuthStatus,
} from "./store/selectors/authSelectors";
import ReportFormPage from "./pages/ReportFormPage";
import LoginPage from "./pages/LoginPage";
import InvoicePage from "./pages/InvoicePage";

function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const username = useAppSelector(selectUsername);
  const loading = useAppSelector(selectAuthLoading);
  const authStatus = useAppSelector(selectAuthStatus);

  const navigate = useNavigate();
  const dispatch = useAppDispatch() as AppDispatch;
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const url_name = params.get("username");

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated) {
        return;
      }

      const storedToken = localStorage.getItem("access_token");

      if (!storedToken) {
        dispatch(logout());
        navigate("/tg_bot_add", { replace: true });
        return;
      }

      try {
        await dispatch(verifyToken(storedToken));
      } catch (error) {
        console.log(error);
        try {
          await dispatch(refreshToken());
        } catch (refreshError) {
          console.log(refreshError);
          dispatch(logout());
          navigate("/tg_bot_add", { replace: true });
        }
      }
    };

    initializeAuth();
  }, [dispatch, navigate, isAuthenticated]);

  if (loading && authStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#f4f3e9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route
            path="/tg_bot_add"
            element={username === url_name ? <ReportFormPage /> : <LoginPage />}
          />
          <Route path="/tg_bot_add/invoice" element={<InvoicePage />} />
        </>
      ) : (
        <Route path="*" element={<LoginPage />} />
      )}
    </Routes>
  );
}

export default App;
