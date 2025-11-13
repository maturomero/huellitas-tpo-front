import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter.jsx";
import { Toaster, toast } from "react-hot-toast";
import { Provider } from 'react-redux'
import { store } from './redux/store'


(() => {
  const wrap = (name) => {
    const original = toast[name];
    toast[name] = (...args) => {
      
      toast.dismiss();
      return original(...args);
    };
  };

  ["success", "error", "loading", "custom"].forEach(wrap);

  const originalPromise = toast.promise;
  toast.promise = (promise, msgs, opts) => {
    toast.dismiss();
    return originalPromise(promise, msgs, opts);
  };
})();

createRoot(document.getElementById("root")).render(
  <Provider store={store} >
    <BrowserRouter>
      <Toaster
        position="bottom-left"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "1.1rem",
            padding: "16px 24px",
            borderRadius: "10px",
          },
          success: {
            style: { background: "#daf5dc", color: "#0f5132", border: "1px solid #0f5132" },
          },
          error: {
            style: { background: "#f8d7da", color: "#842029", border: "1px solid #842029" },
          },
        }}
      />
      <AppRouter />
    </BrowserRouter>
  </Provider>
);


