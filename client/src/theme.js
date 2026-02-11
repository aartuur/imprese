import { createTheme } from "@mui/material";

export const neonTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00f2ff" },
    secondary: { main: "#7000ff" },
    background: { default: "#0a0a0a", paper: "rgba(30, 30, 40, 0.7)" },
    text: { primary: "#ffffff", secondary: "rgba(255,255,255,0.7)" },
    error: { main: "#ff2a6d" },
  },
  typography: {
    fontFamily: "'Inter', 'Exo 2', sans-serif",
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.05em",
      background: "linear-gradient(90deg, #00f2ff 0%, #7000ff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    button: { fontWeight: 700, letterSpacing: "1px" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
            "&:hover fieldset": { borderColor: "#00f2ff", boxShadow: "0 0 15px rgba(0, 242, 255, 0.1)" },
            "&.Mui-focused fieldset": { borderColor: "#00f2ff", boxShadow: "0 0 20px rgba(0, 242, 255, 0.2)" },
          },
          "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#00f2ff" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "16px",
          background: "linear-gradient(135deg, #00f2ff 0%, #0066ff 100%)",
          color: "#000",
          boxShadow: "0 4px 30px rgba(0, 242, 255, 0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 40px rgba(0, 242, 255, 0.5)",
          },
          "&:disabled": {
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.3)",
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(20, 20, 30, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
        }
      }
    }
  },
});