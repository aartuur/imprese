import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
} from "@mui/material";
import { 
  Search, 
  LocationOn, 
  Business, 
  ContentCopy, 
  AutoAwesome, 
  Bolt 
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// --- TEMA FUTURISTICO ---
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00f2ff", // Neon Cyan
    },
    secondary: {
      main: "#7000ff", // Neon Purple
    },
    background: {
      default: "#050505",
      paper: "rgba(20, 20, 30, 0.6)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: {
      fontWeight: 800,
      letterSpacing: "-1px",
      background: "linear-gradient(45deg, #00f2ff 30%, #7000ff 90%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
            "&:hover fieldset": { borderColor: "#00f2ff" },
            "&.Mui-focused fieldset": { borderColor: "#00f2ff", boxShadow: "0 0 10px rgba(0, 242, 255, 0.3)" },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "30px",
          padding: "12px 30px",
          fontSize: "1rem",
          fontWeight: "bold",
          textTransform: "none",
          boxShadow: "0 0 15px rgba(0, 242, 255, 0.3)",
        },
      },
    },
  },
});

// --- COMPONENTE PRINCIPALE ---
export default function BusinessSearch() {
  const [location, setLocation] = useState("Milano, Italia");
  const [query, setQuery] = useState("Ristoranti");
  const [target, setTarget] = useState(5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    setResults([]); // Reset per animazione
    try {
      // Simulazione URL, assicurati che il tuo backend sia su questa porta
      const response = await fetch(
        `http://localhost:8000/api/v1/leads?citta=${encodeURIComponent(location)}&categoria=${encodeURIComponent(query)}&target_leads=${target}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Errore nel fetch:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* BACKGROUND EFFECTS */}
      <Box sx={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        background: "radial-gradient(circle at 10% 20%, rgba(112, 0, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 242, 255, 0.1) 0%, transparent 40%)",
      }} />

      <Container maxWidth="lg" sx={{ mt: 8, mb: 8, position: "relative" }}>
        
        {/* HEADER SECTION */}
        <Box sx={{ textAlign: "center", mb: 6 }} component={motion.div} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            LEAD GENERATION <span style={{ fontSize: "0.5em", verticalAlign: "super", color: "#00f2ff" }}>PRO</span>
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Identifica aziende senza presenza digitale e genera pitch di vendita con AI.
          </Typography>
        </Box>

        {/* SEARCH PANEL */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{
            p: 4,
            borderRadius: "24px",
            background: "rgba(20, 20, 30, 0.4)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0, 0.5)",
            mb: 6
          }}
        >
          <form onSubmit={(e) => { e.preventDefault(); fetchBusinesses(); }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Località Target"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn color="primary" /></InputAdornment>,
                  }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Settore (es. Dentista, Ristorante)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Business color="primary" /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Max Leads"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 20 } }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Bolt />}
                  sx={{ height: "56px", background: "linear-gradient(90deg, #00f2ff, #00aaff)", color: "#000" }}
                >
                  {loading ? "Analisi..." : "Scansiona"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>

        {/* RESULTS GRID */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {results.map((item, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{
                    background: "rgba(30, 30, 40, 0.6)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    overflow: "visible",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 30px rgba(0, 242, 255, 0.1)",
                      border: "1px solid rgba(0, 242, 255, 0.3)"
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
                            {item.nome}
                            <Chip 
                              label="No Website" 
                              size="small" 
                              sx={{ 
                                bgcolor: "rgba(255, 50, 50, 0.1)", 
                                color: "#ff5555", 
                                border: "1px solid rgba(255, 50, 50, 0.3)",
                                fontWeight: "bold"
                              }} 
                            />
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn fontSize="small" sx={{ opacity: 0.7 }}/> {item.indirizzo || item.città}
                          </Typography>
                        </Box>
                        {item.telefono && (
                          <Chip label={item.telefono} variant="outlined" sx={{ color: "#b0b0b0", borderColor: "rgba(255,255,255,0.1)" }} />
                        )}
                      </Box>

                      {/* AI MESSAGE SECTION */}
                      <Box sx={{ 
                        mt: 3, 
                        p: 3, 
                        bgcolor: "rgba(0,0,0,0.3)", 
                        borderRadius: "12px", 
                        borderLeft: "4px solid #7000ff",
                        position: "relative"
                      }}>
                        <Typography variant="caption" sx={{ color: "#7000ff", fontWeight: "bold", mb: 1, display: "block", textTransform: "uppercase", letterSpacing: "1px" }}>
                          <AutoAwesome fontSize="inherit" sx={{ mr: 0.5 }} /> 
                          AI Generated Pitch
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#e0e0e0", fontFamily: "monospace", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                          {item.messaggio_personalizzato || item.messaggio}
                        </Typography>
                        
                        <Tooltip title="Copia Messaggio">
                          <IconButton 
                            onClick={() => copyToClipboard(item.messaggio_personalizzato || item.messaggio)}
                            sx={{ position: "absolute", top: 10, right: 10, color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
        
        {!loading && results.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 10, opacity: 0.3 }}>
            <Search sx={{ fontSize: 60 }} />
            <Typography>Nessun risultato. Lancia una scansione.</Typography>
          </Box>
        )}

      </Container>
    </ThemeProvider>
  );
}