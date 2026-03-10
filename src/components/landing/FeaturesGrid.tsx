import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { ShoppingCart, ChefHat, Users, BarChart3 } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "POS & Orders",
    description:
      "Fast order taking, split bills, and seamless payment processing",
    color: "#3b82f6",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    description:
      "Real-time order tracking with status updates for your kitchen staff",
    color: "#60a5fa",
  },
  {
    icon: Users,
    title: "Staff Management",
    description: "Role-based access control and employee scheduling made easy",
    color: "#3b82f6",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Sales reports, revenue tracking, and daily insights at a glance",
    color: "#22d3ee",
  },
];

const FeaturesGrid: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.mode === "dark" ? "#12121f" : "#ffffff",
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
            Everything Your Restaurant Needs
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 6,
              fontWeight: 400,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Powerful tools designed specifically for restaurants in Ghana
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: "center",
                    p: 4,
                    height: "100%",
                    borderRadius: 3,
                    background:
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      borderColor: feature.color,
                      boxShadow: `0 20px 40px ${feature.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                    }}
                  >
                    <feature.icon size={32} color={feature.color} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      color: "text.primary",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesGrid;
