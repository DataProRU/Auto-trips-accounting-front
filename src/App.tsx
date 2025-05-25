import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ReportFormPage from "./pages/ReportFormPage";

function RedirectToBot() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const username = params.get("username");

  if (username) {
    return <Navigate to={`/tg_add_bot?username=${username}`} replace />;
  } else {
    return <Navigate to="/tg_add_bot" replace />;
  }
}

function App() {
  return (
    <Routes>
      <Route path="/tg_add_bot" element={<ReportFormPage />} />
      <Route path="*" element={<RedirectToBot />} />
    </Routes>
  );
}

export default App;
