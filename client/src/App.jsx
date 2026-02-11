import React from "react";
import { Container, Typography, Box, Grid, Alert, ThemeProvider, CssBaseline, createTheme, Stack } from "@mui/material";
import { SearchOff, WifiTethering, Hub } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

import { useLeadSearch } from "./hooks/useLeadSearch";
import { SearchForm } from "./components/SearchForm";
import { LeadCard } from "./components/LeadCard";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00f2ff' },
    secondary: { main: '#7000ff' },
    background: { default: '#050505', paper: '#0a0a10' },
    text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.7)' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h3: { fontWeight: 800, letterSpacing: "-1px" },
    button: { fontWeight: 700, letterSpacing: "1px" }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#00f2ff #0a0a10",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": { backgroundColor: "#0a0a10", width: "8px" },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": { borderRadius: 8, backgroundColor: "#00f2ff", minHeight: 24 },
        },
      },
    },
  },
});

export default function App() {
  const { leads, loading, error, searchLeads } = useLeadSearch();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      <Box sx={{
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
        position: "relative",
        background: "#050505",
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(112, 0, 255, 0.15) 0%, transparent 50%),
          linear-gradient(180deg, rgba(0,0,0,0) 0%, #050505 100%)
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: "relative", zIndex: 2 }}>
          
          <Box 
            component={motion.div} 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            sx={{ textAlign: "center", mb: 6 }} 
          >
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <WifiTethering sx={{ color: "#00f2ff", fontSize: 20 }} />
              <Typography variant="overline" sx={{ color: "#00f2ff", letterSpacing: "3px", fontWeight: "bold" }}>
                SYSTEM ONLINE
              </Typography>
            </Stack>

            <Typography variant="h3" sx={{ 
              fontSize: { xs: "2.5rem", md: "4rem" },
              background: "linear-gradient(180deg, #fff 0%, #666 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(0, 242, 255, 0.2))",
              mb: 1
            }}>
              LEAD SNIPER
            </Typography>

            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              AI-POWERED PROSPECTING PROTOCOL V2.0
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <SearchForm onSearch={searchLeads} loading={loading} />
          </Box>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert 
                  severity="error" 
                  variant="outlined" 
                  icon={<Hub fontSize="inherit" />}
                  sx={{ mb: 4, borderRadius: "12px", border: "1px solid #ff2a6d", color: "#ff2a6d", "& .MuiAlert-icon": { color: "#ff2a6d" } }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Grid container spacing={3}>
            <AnimatePresence>
              {leads.map((lead, index) => (
                <LeadCard key={index} lead={lead} index={index} />
              ))}
            </AnimatePresence>
          </Grid>
          
          {!loading && leads.length === 0 && !error && (
            <Box 
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              sx={{ textAlign: "center", mt: 8, opacity: 0.3 }}
            >
              <SearchOff sx={{ fontSize: 60, mb: 2, color: "rgba(255,255,255,0.3)" }} />
              <Typography variant="h6" sx={{ fontFamily: "monospace", letterSpacing: "2px" }}>
                NO DATA STREAM
              </Typography>
            </Box>
          )}

        </Container>
      </Box>
    </ThemeProvider>
  );
}