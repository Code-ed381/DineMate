import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Play,
  X,
  ArrowRight,
  CheckCircle,
  Zap,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LandingPageImage from "../../assets/landing.jpg";
import useAuthStore from "../../lib/authStore";
import useRestaurantStore from "../../lib/restaurantStore";

const HeroSection: React.FC = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();

  const accent = "#3b82f6";
  const accent2 = "#60a5fa";

  const kpis = [
    {
      label: "Trusted restaurants",
      value: "500+",
      icon: CheckCircle,
      color: "#4caf50",
    },
    { label: "Setup time", value: "2 mins", icon: Zap, color: accent },
    {
      label: "Data security",
      value: "Secure",
      icon: ShieldCheck,
      color: accent,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: { xs: "auto", md: "92vh" },
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: theme.palette.mode === "dark" ? "#0a0a0f" : "#ffffff",
        pt: { xs: 7, md: 10 },
        pb: { xs: 7, md: 12 },
      }}
    >
      <Box
        component={motion.div}
        aria-hidden
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          inset: 0,
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(60% 60% at 20% 20%, rgba(59,130,246,0.24) 0%, rgba(59,130,246,0) 60%), radial-gradient(55% 55% at 80% 30%, rgba(96,165,250,0.16) 0%, rgba(96,165,250,0) 60%), radial-gradient(70% 70% at 50% 80%, rgba(14,165,233,0.10) 0%, rgba(14,165,233,0) 60%)"
              : "radial-gradient(60% 60% at 20% 20%, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0) 60%), radial-gradient(55% 55% at 80% 30%, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0) 60%)",
          filter: "blur(10px)",
          opacity: theme.palette.mode === "dark" ? 1 : 0.8,
          zIndex: 0,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)"
              : "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(circle at 50% 35%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
          opacity: 0.35,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 5, md: 8 }}
          alignItems="center"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6 }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 2, flexWrap: "wrap" }}
              >
                <Chip
                  size="small"
                  label="Built for Ghana"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 999,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Chip
                  size="small"
                  label="POS • KDS • Staff • Reports"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 999,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              </Stack>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.15rem", sm: "2.6rem", md: "3.25rem" },
                  mb: 2,
                  color: "text.primary",
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
                }}
              >
                Restaurant management,{" "}
                <Box
                  component="span"
                  sx={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #60a5fa 45%, #22d3ee 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  reimagined
                </Box>
                .
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: 520,
                }}
              >
                POS, staff management, and analytics for restaurants in Ghana.
                Everything you need to run your restaurant efficiently.
              </Typography>

              <Stack spacing={1.25} sx={{ mb: 4, maxWidth: 520 }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Zap size={18} color={accent} />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Take orders faster with split bills + multiple payments
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <BarChart3 size={18} color={accent2} />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Track sales, revenue, and daily performance instantly
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <ShieldCheck size={18} color="#4caf50" />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Role-based access for staff and secure session protection
                  </Typography>
                </Box>
              </Stack>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    if (!user) {
                      navigate("/sign-in");
                      return;
                    }
                    if (!selectedRestaurant) {
                      navigate("/restaurant-selection");
                      return;
                    }
                    navigate("/app/dashboard");
                  }}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                    boxShadow: "0 14px 40px rgba(59,130,246,0.25)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)",
                      boxShadow: "0 18px 60px rgba(59,130,246,0.35)",
                      transform: "translateY(-1px)",
                    },
                  }}
                  endIcon={<ArrowRight size={20} />}
                >
                  {user ? "Go to Dashboard" : "Sign In to Continue"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setDemoOpen(true)}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    borderColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(0,0,0,0.12)",
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                    "&:hover": {
                      borderColor: accent,
                      background:
                        theme.palette.mode === "dark"
                          ? "rgba(59,130,246,0.10)"
                          : "rgba(59,130,246,0.06)",
                      transform: "translateY(-1px)",
                    },
                  }}
                  startIcon={<Play size={20} />}
                >
                  Watch Demo
                </Button>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ alignItems: { sm: "center" } }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    border: `1px solid ${theme.palette.divider}`,
                    width: "fit-content",
                  }}
                >
                  <CheckCircle size={18} color="#4caf50" />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Trusted by <strong>500+</strong> restaurants across Ghana
                  </Typography>
                </Paper>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  14-day free trial • No credit card required
                </Typography>
              </Stack>
            </motion.div>

            <Box sx={{ mt: 4 }}>
              <Grid container spacing={2} sx={{ maxWidth: 520 }}>
                {kpis.map((kpi, idx) => (
                  <Grid item xs={12} sm={4} key={kpi.label}>
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-120px" }}
                      transition={{ duration: 0.45, delay: 0.35 + idx * 0.08 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(0,0,0,0.02)",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <kpi.icon size={16} color={kpi.color} />
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            {kpi.label}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 800, color: "text.primary" }}
                        >
                          {kpi.value}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  padding: "1px",
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.7) 0%, rgba(34,211,238,0.35) 40%, rgba(96,165,250,0.55) 100%)",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 28px 90px rgba(0,0,0,0.55)"
                      : "0 28px 90px rgba(0,0,0,0.18)",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(18,18,31,0.65)"
                        : "rgba(255,255,255,0.85)",
                    border: `1px solid ${theme.palette.divider}`,
                    backdropFilter: "blur(14px)",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ display: "flex", gap: 0.75 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.18)",
                          }}
                        />
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.18)",
                          }}
                        />
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.18)",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Live dashboard preview
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label="Realtime"
                      sx={{
                        fontWeight: 800,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(76,175,80,0.14)"
                            : "rgba(76,175,80,0.10)",
                        color: "#4caf50",
                        border: "1px solid rgba(76,175,80,0.25)",
                      }}
                    />
                  </Box>

                  <Box
                    component="img"
                    src={LandingPageImage}
                    alt="DineMate Dashboard"
                    loading="lazy"
                    sx={{
                      width: "100%",
                      display: "block",
                      transform: "scale(1.02)",
                    }}
                  />
                </Paper>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Demo Modal */}
      <Dialog
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.background.default,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            DineMate Demo
          </Typography>
          <IconButton onClick={() => setDemoOpen(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: "relative",
              paddingTop: "56.25%",
              background: theme.palette.mode === "dark" ? "#1a1a2e" : "#f5f5f5",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", position: "absolute" }}
            >
              Demo video coming soon
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HeroSection;
