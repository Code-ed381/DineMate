import React from "react";
import { Box, Typography, Container, Paper, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { UserPlus, Settings, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign Up",
    description:
      "Create your account in just 2 minutes. No credit card required.",
    color: "#3b82f6",
  },
  {
    number: "02",
    icon: Settings,
    title: "Setup Restaurant",
    description: "Add your menu items, staff members, and table layout.",
    color: "#60a5fa",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Start Selling",
    description:
      "Take orders and track your restaurant's performance in real-time.",
    color: "#22d3ee",
  },
];

const HowItWorks: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.mode === "dark" ? "#0a0a0f" : "#f8f9fa",
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              mb: 2,
              color: "text.primary",
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 8,
              fontWeight: 400,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Get started in three simple steps
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={step.number}
              sx={{ position: "relative", flex: 1, maxWidth: 320 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "#ffffff",
                    border: `1px solid ${theme.palette.divider}`,
                    height: "100%",
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      color: step.color,
                      opacity: 0.3,
                      mb: 1,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: `${step.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <step.icon size={28} color={step.color} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: "text.primary",
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Paper>
              </motion.div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    position: "absolute",
                    right: -30,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: theme.palette.divider,
                  }}
                >
                  <ArrowRight size={24} />
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorks;
