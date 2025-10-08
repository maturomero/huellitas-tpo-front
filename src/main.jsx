import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // ✅ esto
import AppRouter from "./router/AppRouter.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>

);
