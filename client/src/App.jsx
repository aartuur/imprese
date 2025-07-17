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
        `http://localhost:8000/imprese-senza-sito?${params.toString()}`
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
          py: 6,
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            gutterBottom
            sx={{ fontWeight: "bold", color: "primary.main", textAlign: "center" }}
          >
            IMPRESE SENZA SITO UFFICIALE
          </Typography>

          {/* FORM BOX */}
          <Paper
            elevation={6}
            sx={{
              p: 4,
              mb: 4,
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
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <TextField
                  label="Paese"
                  value={paese}
                  onChange={(e) => setPaese(e.target.value)}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Città"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  required
                  fullWidth
                  size="small"
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
                />
              </Stack>

              <TextField
                label="Parole chiave"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="Premi Enter per aggiungere"
                fullWidth
                size="small"
              />

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {keywords.map((keyword, idx) => (
                  <Chip
                    key={idx}
                    label={keyword}
                    onDelete={() => handleKeywordDelete(keyword)}
                    color="secondary"
                  />
                ))}
              </Stack>

              <Box display="flex" justifyContent="center" mt={1}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    width: 160,
                    bgcolor: "secondary.main",
                    color: "secondary.contrastText",
                    fontWeight: "bold",
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
              p: 4,
              bgcolor: "#fff9e463",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgb(251 192 45 / 0.25)",
              width: "100%",
              maxWidth: "93%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {loading && (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress color="primary" />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
                {error}
              </Alert>
            )}

            {!loading && !error && imprese.length === 0 && (
              <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
                Nessuna impresa trovata
              </Alert>
            )}

            {!loading && !error && imprese.length > 0 && (
              <Stack spacing={4}>
                {imprese.map((impresa, idx) => (
                  <Paper
                    key={idx}
                    elevation={6}
                    sx={{
                      p: 3,
                      bgcolor: "white",
                      borderLeft: "6px solid",
                      borderColor: "secondary.main",
                      textAlign:"center",
                      boxShadow: "0 4px 20px rgb(251 192 45 / 0.3)",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "translateY(-5px)" },
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      {impresa.nome}
                    </Typography>

                    <Stack spacing={1}>
                      {Object.entries(impresa).map(([key, value]) => {
                        if (key === "nome" || value == null || value === "") return null;

                        if (key === "sito") {
                          return (
                            <Typography variant="body2" key={key}>
                              <strong>Sito:</strong>{" "}
                              <Link
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                sx={{ color: "secondary.main", fontWeight: "bold" }}
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
                              sx={{ whiteSpace: "pre-wrap", color: "text.primary" }}
                              key={key}
                            >
                              {value}
                            </Typography>
                          );
                        }

                        const label = key.charAt(0).toUpperCase() + key.slice(1);

                        return (
                          <Typography variant="body2" key={key}>
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
