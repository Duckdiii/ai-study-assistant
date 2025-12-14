import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" },   // xanh hiện đại
    secondary: { main: "#7c3aed" }, // tím nhẹ
    background: { default: "#f6f7fb" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Arial"].join(","),
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
  },
});
