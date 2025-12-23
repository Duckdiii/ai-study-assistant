import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { AuthProvider } from "./hooks/useAuth";
import { NotificationsProvider } from "./hooks/useNotifications";
import { theme } from "./theme";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>,
    </BrowserRouter>
  </StrictMode>
);
