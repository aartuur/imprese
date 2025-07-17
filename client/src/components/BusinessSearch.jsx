import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, CircularProgress } from "@mui/material";

export default function BusinessSearch() {
  const [location, setLocation] = useState("Milano, Italia");
  const [query, setQuery] = useState("ristoranti");
  const [target, setTarget] = useState(5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/imprese-senza-sito?location=${encodeURIComponent(location)}&query=${encodeURIComponent(query)}&target=${target}`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Errore nel fetch:", error);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ricerca imprese senza sito web
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          fetchBusinesses();
        }}
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}
      >
        <TextField
          label="Località"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          sx={{ flex: 1 }}
        />
        <TextField
          label="Ricerca (es. ristoranti)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          sx={{ flex: 1 }}
        />
        <TextField
          label="Numero risultati"
          type="number"
          value={target}
          onChange={(e) => setTarget(parseInt(e.target.value, 10))}
          inputProps={{ min: 1, max: 50 }}
          required
          sx={{ width: 120 }}
        />
        <Button variant="contained" type="submit" sx={{ minWidth: 120 }}>
          Cerca
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {!loading && results.length > 0 && (
        <Box>
          {results.map(({ nome, sito, messaggio }, index) => (
            <Box
              key={index}
              sx={{
                mb: 3,
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6">{nome}</Typography>
              {sito && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Sito: <a href={sito} target="_blank" rel="noopener noreferrer">{sito}</a>
                </Typography>
              )}
              <Typography variant="body1">{messaggio}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}
