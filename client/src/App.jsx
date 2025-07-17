import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
  Box,
  Grid,
  TextField,
  Button,
  createTheme,
  ThemeProvider,
  Stack,
  Chip,
} from "@mui/material";

// Palette blu chiaro e oro
const theme = createTheme({
  palette: {
    primary: { main: "#145699ff", light: "#30638dff", contrastText: "#fff" },
    secondary: { main: "#fbc02d", light: "#ffd54f", contrastText: "#000" },
    background: { default: "#e3f2fd", paper: "#fff" },
  },
  typography: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
});

export default function App() {
  const [imprese, setImprese] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paese, setPaese] = useState("Italia");
  const [citta, setCitta] = useState("Milano");
  const [target, setTarget] = useState(5);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleKeywordDelete = (keywordToDelete) => {
    setKeywords((prev) => prev.filter((k) => k !== keywordToDelete));
  };

  const fetchImprese = async () => {
    setLoading(true);
    setError(null);
    setImprese([]);
    try {
      const params = new URLSearchParams({
        paese,
        città: citta,
        target,
        keywords: keywords.join(","),
      });
      const response = await fetch(
        `https://imprese-1.onrender.com/imprese-senza-sito?${params.toString()}`
      );
      if (!response.ok) throw new Error("Errore nel recupero dati");
      const data = await response.json();
      setImprese(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          bgcolor: "background.default",
          py: { xs: 2, sm: 4, md: 6 },
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 } }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{ 
              fontWeight: "bold", 
              color: "primary.main", 
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
              px: { xs: 2, sm: 0 },
              mb: { xs: 2, sm: 3 }
            }}
          >
            IMPRESE SENZA SITO UFFICIALE
          </Typography>

          {/* FORM BOX */}
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              mb: { xs: 2, sm: 3, md: 4 },
              mx: { xs: 1, sm: 0 },
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: "0 6px 15px rgb(20 86 153 / 0.2)",
              maxWidth: "100%",
            }}
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              fetchImprese();
            }}
          >
            <Stack spacing={{ xs: 2, sm: 2 }}>
              <Stack 
                direction={{ xs: "column", sm: "row" }} 
                spacing={{ xs: 2, sm: 2 }} 
                justifyContent="center"
              >
                <TextField
                  label="Paese"
                  value={paese}
                  onChange={(e) => setPaese(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
                <TextField
                  label="Città"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
                <TextField
                  label="Numero risultati"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, max: 50 }}
                  required
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
              </Stack>

              <TextField
                label="Tipo di impresa"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Premi Enter per aggiungere"
                fullWidth
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />

              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: "wrap",
                  gap: { xs: 0.5, sm: 1 }
                }}
              >
                {keywords.map((keyword, idx) => (
                  <Chip
                    key={idx}
                    label={keyword}
                    onDelete={() => handleKeywordDelete(keyword)}
                    color="secondary"
                    size="small"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      height: { xs: 28, sm: 32 },
                      mb: { xs: 0.5, sm: 0 }
                    }}
                  />
                ))}
              </Stack>

              <Box display="flex" justifyContent="center" mt={1}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    width: { xs: "100%", sm: 160 },
                    height: { xs: 48, sm: 40 },
                    bgcolor: "secondary.main",
                    color: "secondary.contrastText",
                    fontWeight: "bold",
                    fontSize: { xs: '1rem', sm: '0.875rem' }
                  }}
                >
                  Cerca
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* RISULTATI BOX */}
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              mx: { xs: 1, sm: 0 },
              bgcolor: "#fff9e463",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgb(251 192 45 / 0.25)",
              width: { xs: "calc(100% - 16px)", sm: "100%" },
              maxWidth: { xs: "100%", sm: "93%" },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {loading && (
              <Box display="flex" justifyContent="center" my={{ xs: 2, sm: 4 }}>
                <CircularProgress color="primary" size={{ xs: 30, sm: 40 }} />
              </Box>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  maxWidth: { xs: "100%", sm: 600 }, 
                  mx: "auto",
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {error}
              </Alert>
            )}

            {!loading && !error && imprese.length === 0 && (
              <Alert 
                severity="info" 
                sx={{ 
                  maxWidth: { xs: "100%", sm: 600 }, 
                  mx: "auto",
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Nessuna impresa trovata
              </Alert>
            )}

            {!loading && !error && imprese.length > 0 && (
              <Stack spacing={{ xs: 2, sm: 3, md: 4 }}>
                {imprese.map((impresa, idx) => (
                  <Paper
                    key={idx}
                    elevation={6}
                    sx={{
                      p: { xs: 2, sm: 3 },
                      bgcolor: "white",
                      borderLeft: { xs: "4px solid", sm: "6px solid" },
                      borderColor: "secondary.main",
                      textAlign: "center",
                      boxShadow: "0 4px 20px rgb(251 192 45 / 0.3)",
                      transition: "transform 0.3s",
                      "&:hover": { 
                        transform: { xs: "none", sm: "translateY(-5px)" }
                      },
                      borderRadius: { xs: 1, sm: 2 }
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ 
                        fontWeight: "bold", 
                        color: "primary.main",
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        lineHeight: { xs: 1.3, sm: 1.4 },
                        mb: { xs: 1.5, sm: 2 },
                        wordBreak: "break-word"
                      }}
                    >
                      {impresa.nome}
                    </Typography>

                    <Stack spacing={{ xs: 1, sm: 1 }}>
                      {Object.entries(impresa).map(([key, value]) => {
                        if (key === "nome" || value == null || value === "") return null;

                        if (key === "sito") {
                          return (
                            <Typography 
                              variant="body2" 
                              key={key}
                              sx={{ 
                                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                textAlign: { xs: "left", sm: "center" },
                                wordBreak: "break-all"
                              }}
                            >
                              <strong>Sito:</strong>{" "}
                              <Link
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                sx={{ 
                                  color: "secondary.main", 
                                  fontWeight: "bold",
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                              >
                                {value}
                              </Link>
                            </Typography>
                          );
                        }

                        if (key === "messaggio") {
                          return (
                            <Typography
                              variant="body1"
                              sx={{ 
                                whiteSpace: "pre-wrap", 
                                color: "text.primary",
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                textAlign: { xs: "left", sm: "center" },
                                lineHeight: { xs: 1.4, sm: 1.5 },
                                wordBreak: "break-word"
                              }}
                              key={key}
                            >
                              {value}
                            </Typography>
                          );
                        }

                        const label = key.charAt(0).toUpperCase() + key.slice(1);

                        return (
                          <Typography 
                            variant="body2" 
                            key={key}
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '0.875rem' },
                              textAlign: { xs: "left", sm: "center" },
                              wordBreak: "break-word"
                            }}
                          >
                            <strong>{label}:</strong> {value}
                          </Typography>
                        );
                      })}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
