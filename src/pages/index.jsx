import React from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Container,
  AppBar,
  Toolbar,
  useTheme,
  Paper,
} from "@mui/material";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/theme-toggle";
import LandingPageImage from '../assets/landing.jpg'
import Logo from '../assets/logo.png'

export default function IndexPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isDark ? "background.default" : "background.paper",
        color: "text.primary",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Navigation Bar */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <img src={Logo} alt="Logo" width={50} height={50} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              DineMate
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ThemeToggle />
            <Button
              color="primary"
              variant="text"
              onClick={() => navigate("/sign-in")}
              sx={{ fontWeight: 600 }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/sign-up")}
              sx={{ ml: 2, fontWeight: 600 }}
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: "text.primary",
              }}
            >
              DineMate is a restaurant management system that helps you to manage your restaurant effortlessly.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              All-in-one POS, staff management, and analytics for restaurants,
              cafés, and bars. Built for growth. Powered by simplicity.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/sign-up")}
            >
              Start Free
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{ ml: 2 }}
              onClick={() => navigate("/learn-more")}
            >
              Learn More
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={LandingPageImage}
              alt="Dashboard preview"
              sx={{
                width: "100%",
                borderRadius: 3,
                boxShadow: isDark
                  ? "0px 10px 25px rgba(0,0,0,0.5)"
                  : "0px 10px 25px rgba(0,0,0,0.1)",
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: 12, mb: 10 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 6,
            color: "text.primary",
          }}
        >
          Everything your restaurant needs
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "POS & Orders",
              desc: "Fast, reliable order taking—online or offline.",
              icon: "🧾",
            },
            {
              title: "Staff Management",
              desc: "Add team members, assign roles, and track performance.",
              icon: "👩‍🍳",
            },
            {
              title: "Multi-Restaurant",
              desc: "Manage multiple branches from one dashboard.",
              icon: "🏪",
            },
            {
              title: "Analytics & Insights",
              desc: "See your bestsellers, revenue trends, and daily reports.",
              icon: "📊",
            },
          ].map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Paper
                elevation={isDark ? 3 : 1}
                sx={{
                  textAlign: "center",
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {feature.icon}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} DineMate. Built with ❤️ for Ghana’s
          restaurants.
        </Typography>
      </Box>
    </Box>
  );
}
