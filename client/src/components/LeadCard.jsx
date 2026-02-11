import React from "react";
import { 
  Grid, Box, Typography, Chip, Tooltip, IconButton, Stack, Link 
} from "@mui/material";
import { 
  LocationOn, Language, ContentCopy, 
  Phone, Terminal, VerifiedUser, GppBad, Business 
} from "@mui/icons-material";
import { motion as Motion } from "framer-motion";

// Definizione del tema (puoi spostarla in un file separato se preferisci)
const THEME = {
  primary: "#00f2ff",    // Cyan
  secondary: "#7000ff",  // Viola
  warning: "#f2ff00",    // Giallo Cyber
  danger: "#ff0055",     // Rosso Neon
  success: "#00ff9d",    // Verde Matrix
  bg: "rgba(10, 10, 16, 0.6)",
  bgDark: "rgba(0, 0, 0, 0.4)",
  glass: "blur(10px)",
  border: "rgba(0, 242, 255, 0.15)",
  fontMono: "'Courier New', monospace",
};

export const LeadCard = ({ lead, index }) => {
  
  // Funzione per copiare il testo della pitch
  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      // Qui potresti aggiungere un feedback visivo (es. snackbar)
    }
  };

  // Determina colore e icona in base allo stato
  // Logica: 
  // - Directory Only = Warning (Giallo)
  // - No Website = Danger (Rosso - Alta priorità per vendita sito)
  // - Has Website = Success/Primary (Azzurro - Magari per servizi SEO)
  let statusColor = THEME.primary;
  let StatusIcon = Business;

  if (lead.current_status === "Directory Only") {
    statusColor = THEME.warning;
    StatusIcon = VerifiedUser;
  } else if (lead.current_status === "No Website") {
    statusColor = THEME.danger;
    StatusIcon = GppBad;
  }

  return (
    <Grid item xs={12}>
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Box
          sx={{
            position: "relative",
            background: THEME.bg,
            backdropFilter: THEME.glass,
            border: `1px solid ${THEME.border}`,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: `0 10px 40px -10px ${THEME.primary}30`,
              border: `1px solid ${THEME.primary}60`,
              "& .accent-bar": { height: "100%" }
            }
          }}
        >
          {/* Barra laterale decorativa animata */}
          <Box 
            className="accent-bar"
            sx={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: "4px",
              height: "40%", 
              background: `linear-gradient(to bottom, ${THEME.primary}, ${THEME.secondary})`,
              transition: "height 0.4s ease",
              boxShadow: `2px 0 10px ${THEME.primary}80`,
              zIndex: 2
            }} 
          />

          <Grid container>
            
            {/* --- COLONNA SINISTRA: DATI AZIENDA --- */}
            <Grid item xs={12} md={5} sx={{ p: 3, pl: 4 }}>
              <Stack spacing={2}>
                
                {/* Header: Nome + Status */}
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800, 
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    lineHeight: 1.2,
                    mb: 1.5,
                    fontSize: { xs: "1.2rem", md: "1.4rem" }
                  }}>
                    {lead.business_name || "NOME SCONOSCIUTO"}
                  </Typography>
                  
                  <Chip 
                    icon={<StatusIcon style={{ color: statusColor }} />}
                    label={lead.current_status || "STATUS SCONOSCIUTO"} 
                    size="small"
                    sx={{ 
                      borderRadius: "4px", 
                      bgcolor: `${statusColor}15`, 
                      color: statusColor,
                      border: `1px solid ${statusColor}40`,
                      fontFamily: THEME.fontMono,
                      fontWeight: "bold",
                      letterSpacing: "0.5px",
                      "& .MuiChip-icon": { color: statusColor }
                    }} 
                  />
                </Box>

                {/* Dettagli Contatto */}
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  
                  {/* Indirizzo (mostra sempre, fallback se vuoto) */}
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <LocationOn sx={{ color: THEME.primary, fontSize: 20, mt: 0.3 }} /> 
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      {lead.address || "Posizione non rilevata"}
                    </Typography>
                  </Box>

                  {/* Telefono (render condizionale) */}
                  {lead.phone && (
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Phone sx={{ color: THEME.secondary, fontSize: 20 }} />
                      <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontFamily: THEME.fontMono }}>
                        {lead.phone}
                      </Typography>
                    </Box>
                  )}

                  {/* Sito Web (render condizionale) */}
                  {lead.detected_url && (
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Language sx={{ color: "#fff", fontSize: 20 }} />
                      <Link 
                        href={lead.detected_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        underline="hover"
                        sx={{ 
                          color: THEME.primary, 
                          fontFamily: THEME.fontMono, 
                          fontSize: "0.85rem",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          maxWidth: "250px"
                        }}
                      >
                        {lead.detected_url}
                      </Link>
                    </Box>
                  )}
                </Stack>
              </Stack>
            </Grid>

            {/* --- COLONNA DESTRA: AI PITCH (Stile Terminale) --- */}
            <Grid item xs={12} md={7} sx={{ 
              bgcolor: THEME.bgDark, 
              borderLeft: { xs: "none", md: `1px solid rgba(255,255,255,0.05)` },
              borderTop: { xs: `1px solid rgba(255,255,255,0.05)`, md: "none" },
              display: "flex",
              flexDirection: "column",
              minHeight: "200px" // Altezza minima garantita
            }}>
              <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                
                {/* Terminal Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Terminal sx={{ color: THEME.secondary, fontSize: 18 }} />
                    <Typography variant="caption" sx={{ 
                      color: THEME.secondary, 
                      fontWeight: 700, 
                      letterSpacing: "1px",
                      fontFamily: THEME.fontMono 
                    }}>
                      AI_OUTREACH_PROTOCOL_V3
                    </Typography>
                  </Stack>
                  
                  <Tooltip title="Copia Script">
                    <IconButton 
                      size="small"
                      onClick={() => copyToClipboard(lead.sales_pitch)}
                      disabled={!lead.sales_pitch}
                      sx={{ 
                        color: "rgba(255,255,255,0.4)", 
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "4px",
                        "&:hover": { 
                          color: THEME.primary, 
                          bgcolor: "rgba(0, 242, 255, 0.1)",
                          borderColor: THEME.primary 
                        } 
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Content */}
                <Box sx={{ 
                  flex: 1,
                  fontFamily: THEME.fontMono,
                  fontSize: "0.85rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-line",
                  overflowY: "auto",
                  maxHeight: "180px",
                  pr: 1,
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.02)" },
                  "&::-webkit-scrollbar-thumb": { background: THEME.secondary, borderRadius: "2px" }
                }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", marginRight: "8px" }}>&gt;</span>
                  {lead.sales_pitch ? lead.sales_pitch : "Analisi dati in corso o non disponibile..."}
                  <span className="blinking-cursor">_</span>
                </Box>
                
              </Box>
            </Grid>
          </Grid>

          {/* Stili globali per il cursore */}
          <style>{`
            @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
            .blinking-cursor { color: ${THEME.primary}; animation: blink 1s step-end infinite; font-weight: bold; margin-left: 2px; }
          `}</style>
        </Box>
      </Motion.div>
    </Grid>
  );
};