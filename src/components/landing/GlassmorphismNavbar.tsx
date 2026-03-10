import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "../theme-toggle";
import Logo from "../../assets/logo.png";
import useAuthStore from "../../lib/authStore";
import useRestaurantStore from "../../lib/restaurantStore";

const GlassmorphismNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 280, height: "100%", bgcolor: "background.default" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.label}
            onClick={() => scrollToSection(item.href)}
            sx={{
              borderRadius: 2,
              mb: 1,
              cursor: "pointer",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate("/sign-in");
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 2 }}
          >
            Sign In
          </Button>
        </ListItem>
        <ListItem>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              navigate("/sign-up");
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 2 }}
          >
            Get Started
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backdropFilter: "blur(20px)",
          background:
            theme.palette.mode === "dark"
              ? "rgba(10, 10, 15, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src={Logo} alt="DineMate" width={40} height={40} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #3b82f6 0%, #60a5fa 55%, #22d3ee 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              DineMate
            </Typography>
          </Box>

          {isMobile ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThemeToggle />
              <IconButton onClick={handleDrawerToggle} edge="end">
                <MenuIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <ThemeToggle />
              {user ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (!selectedRestaurant) {
                      navigate("/restaurant-selection");
                      return;
                    }
                    navigate("/app/dashboard");
                  }}
                  sx={{ fontWeight: 600, borderRadius: 2 }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    color="primary"
                    onClick={() => navigate("/sign-in")}
                    sx={{ fontWeight: 600 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/sign-up")}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            bgcolor: "background.default",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Spacer for fixed navbar */}
      <Box sx={{ height: 64 }} />
    </>
  );
};

export default GlassmorphismNavbar;
