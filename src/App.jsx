import { Route, Routes } from "react-router-dom";
import ReportPage from "./pages/ReportPage/ReportPage";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ReportPage />} />
      </Routes>
    </>
  );
}

export default App;
