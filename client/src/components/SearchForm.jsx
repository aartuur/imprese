import React, { useState } from "react";
import { 
  Grid, TextField, Button, InputAdornment, Box, 
  CircularProgress, Chip, Stack, Typography, Paper 
} from "@mui/material";
import { 
  Public, Map, Category, Tune, 
  Terminal, FlashOn 
} from "@mui/icons-material";

const THEME = {
  primary: "#00f2ff",
  secondary: "#00d4ff",
  bg: "#0b0b0f",
  paper: "#111116",
  border: "rgba(0, 242, 255, 0.2)",
  textDim: "rgba(255, 255, 255, 0.5)",
  textBright: "#ffffff"
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "800px", 
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
  },
  paper: {
    width: "100%",
    padding: "48px",
    background: `linear-gradient(180deg, ${THEME.paper} 0%, #050505 100%)`,
    border: `1px solid ${THEME.border}`,
    borderRadius: "2px", // Angoli più duri per look tech
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
    // Dettaglio tech angolo alto a destra
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      borderTop: `40px solid ${THEME.primary}`,
      borderLeft: "40px solid transparent",
      opacity: 0.3
    },
    // Dettaglio tech angolo basso a sinistra
    "&::before": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "20px",
      height: "20px",
      borderBottom: `2px solid ${THEME.primary}`,
      borderLeft: `2px solid ${THEME.primary}`,
    }
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    position: "relative",
    zIndex: 2
  },
  input: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255,255,255,0.03)",
      borderRadius: "4px",
      fontFamily: "'Courier New', monospace", // Font stile terminale
      fontSize: "0.9rem",
      color: THEME.textBright,
      transition: "all 0.3s ease",
      "& fieldset": { 
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: "1px"
      },
      "&:hover fieldset": { 
        borderColor: "rgba(0, 242, 255, 0.5)",
        boxShadow: `0 0 8px ${THEME.primary}20` 
      },
      "&.Mui-focused fieldset": { 
        borderColor: THEME.primary,
        borderWidth: "1px",
        boxShadow: `0 0 15px ${THEME.primary}30`
      }
    },
    "& .MuiInputLabel-root": { 
      color: THEME.textDim, 
      fontFamily: "sans-serif",
      letterSpacing: "1px",
      fontSize: "0.8rem",
      textTransform: "uppercase"
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: THEME.primary
    }
  },
  button: {
    height: "64px",
    width: "100%",
    background: THEME.primary,
    color: "#000",
    fontWeight: "900",
    fontSize: "1rem",
    letterSpacing: "4px",
    borderRadius: "2px",
    marginTop: "24px",
    // Clip-path per angolo tagliato (Cyberpunk style)
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: `0 0 20px ${THEME.primary}40`,
    "&:hover": { 
      background: "#fff",
      boxShadow: `0 0 40px ${THEME.primary}80`,
      transform: "translateY(-2px)"
    },
    "&:disabled": {
      background: "#333",
      color: "#555"
    }
  }
};

export const SearchForm = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState({
    country: "Italia",
    city: "Milano",
    category: "",
    limit: 10
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Box sx={styles.container}>
      <Paper elevation={0} sx={styles.paper}>
        
        {/* --- HEADER --- */}
        <Box sx={styles.header}>
          <Stack direction="column" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ borderBottom: `1px solid ${THEME.border}`, pb: 2, px: 4 }}>
              <Terminal sx={{ color: THEME.primary, fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800, letterSpacing: "3px" }}>
                RECON_MODULE <span style={{ color: THEME.primary, fontSize: "0.6em", verticalAlign: "top" }}>v2.0</span>
              </Typography>
            </Stack>
            
            <Chip 
              label="SYSTEM READY" 
              size="small" 
              sx={{ 
                bgcolor: "rgba(0, 242, 255, 0.05)", 
                color: THEME.primary, 
                border: `1px solid ${THEME.primary}40`,
                fontSize: "0.65rem", 
                fontWeight: 700,
                letterSpacing: "1px",
                borderRadius: "4px"
              }} 
            />
          </Stack>
        </Box>

        {/* --- FORM --- */}
        <form onSubmit={(e) => { e.preventDefault(); onSearch(formData); }}>
          <Grid container spacing={4} sx={{
            display: "flex",
            // flexDirection: "column",
            justifyContent:'center',
            alignItems:'center',
          }}>
            
            {/* Riga 1: Geolocation */}
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Target Country" 
                value={formData.country} 
                onChange={handleChange("country")} 
                sx={styles.input}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Public sx={{ color: THEME.textDim, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Target City" 
                value={formData.city} 
                onChange={handleChange("city")} 
                sx={styles.input} 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Map sx={{ color: THEME.textDim, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Riga 2: Parameters */}
            <Grid item xs={12} sm={8}>
              <TextField 
                fullWidth 
                label="Search Category" 
                placeholder="es. Cybersecurity, Server, Food..."
                value={formData.category} 
                onChange={handleChange("category")} 
                sx={styles.input} 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category sx={{ color: THEME.textDim, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth 
                label="Max Results" 
                type="number" 
                value={formData.limit} 
                onChange={handleChange("limit")} 
                sx={styles.input} 
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tune sx={{ color: THEME.textDim, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Action Button */}
            <Grid item xs={12}>
              <Button 
                type="submit" 
                disabled={loading}
                variant="contained"
                sx={styles.button}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CircularProgress size={20} sx={{ color: "#000" }} />
                    <span>PROCESSING DATA...</span>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FlashOn sx={{ fontSize: 20 }} />
                    <span>INITIALIZE SCAN</span>
                  </Stack>
                )}
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
};