import React from "react";
import { 
  Grid, Box, Typography, Chip, Tooltip, IconButton, Stack, Link 
} from "@mui/material";
import { 
  LocationOn, Language, ContentCopy, 
  Phone,  Terminal, VerifiedUser, GppBad 
} from "@mui/icons-material";
import { motion } from "framer-motion";

// --- STESSO TEMA DEL SEARCHFORM PER COERENZA ---
const THEME = {
  primary: "#00f2ff",    // Cyan
  secondary: "#7000ff",  // Viola
  warning: "#f2ff00",    // Giallo Cyber
  danger: "#ff0055",     // Rosso Neon
  bg: "rgba(10, 10, 16, 0.6)",
  bgDark: "rgba(0, 0, 0, 0.4)",
  glass: "blur(10px)",
  border: "rgba(0, 242, 255, 0.15)",
  fontMono: "'Courier New', monospace",
};

export const LeadCard = ({ lead, index }) => {
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Qui potresti aggiungere un toast/snackbar di conferma
  };

  // Determina colore e icona in base allo stato
  const isDirectoryOnly = lead.current_status === "Directory Only";
  const statusColor = isDirectoryOnly ? THEME.warning : THEME.danger;
  const StatusIcon = isDirectoryOnly ? VerifiedUser : GppBad;

  return (
    <Grid item xs={12}>
      <motion.div
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
              "& .accent-bar": { height: "100%" } // Effetto hover sulla barra laterale
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
              height: "40%", // Parte parziale, cresce in hover
              background: `linear-gradient(to bottom, ${THEME.primary}, ${THEME.secondary})`,
              transition: "height 0.4s ease",
              boxShadow: `2px 0 10px ${THEME.primary}80`
            }} 
          />

          <Grid container>
            
            {/* --- COLONNA SINISTRA: DATI AZIENDA --- */}
            <Grid item xs={12} md={5} sx={{ p: 3, pl: 4 }}>
              <Stack spacing={2}>
                
                {/* Header: Nome + Status */}
                <Box>
                  <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} mb={1}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 800, 
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      lineHeight: 1.2
                    }}>
                      {lead.business_name}
                    </Typography>
                  </Stack>
                  
                  <Chip 
                    icon={<StatusIcon style={{ color: statusColor }} />}
                    label={lead.current_status || "NO_DATA"} 
                    size="small"
                    sx={{ 
                      borderRadius: "4px", // Squadrato stile tech
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
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <LocationOn sx={{ color: THEME.primary, fontSize: 20 }} /> 
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      {lead.address || "Posizione sconosciuta"}
                    </Typography>
                  </Box>

                  {lead.phone && (
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Phone sx={{ color: THEME.secondary, fontSize: 20 }} />
                      <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontFamily: THEME.fontMono }}>
                        {lead.phone}
                      </Typography>
                    </Box>
                  )}

                  {lead.detected_url && (
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Language sx={{ color: "#fff", fontSize: 20 }} />
                      <Link 
                        href={lead.detected_url} 
                        target="_blank" 
                        underline="hover"
                        sx={{ 
                          color: THEME.primary, 
                          fontFamily: THEME.fontMono, 
                          fontSize: "0.85rem",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap"
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
              position: "relative"
            }}>
              <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                
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
                  maxHeight: "150px", // Scrollabile se troppo lungo
                  pr: 1,
                  // Custom Scrollbar
                  "&::-webkit-scrollbar": { width: "4px" },
                  "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.02)" },
                  "&::-webkit-scrollbar-thumb": { background: THEME.secondary, borderRadius: "2px" }
                }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", marginRight: "8px" }}>&gt;</span>
                  {lead.sales_pitch || "Analisi dati insufficiente per generare pitch..."}
                  <span className="blinking-cursor">_</span>
                </Box>
                
              </Box>
            </Grid>
          </Grid>

          {/* Stili globali CSS-in-JS per il cursore lampeggiante */}
          <style>{`
            @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
            .blinking-cursor { color: ${THEME.primary}; animation: blink 1s step-end infinite; font-weight: bold; }
          `}</style>
        </Box>
      </motion.div>
    </Grid>
  );
};