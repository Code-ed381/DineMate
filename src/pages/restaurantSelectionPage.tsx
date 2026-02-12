import React, { useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Avatar,
  CircularProgress,
  IconButton,
  Container,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useRestaurantStore from "../lib/restaurantStore";
import useAuthStore from "../lib/authStore";
import { useSettingsStore } from "../lib/settingsStore";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const RestaurantSelectionPage: React.FC = () => {
  const { restaurants, getRestaurants, setSelectedRestaurant, setRole, loading } =
    useRestaurantStore();
  const { signOut, user } = useAuthStore();
  const { fetchSettings } = useSettingsStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.first_name || user?.user_metadata?.firstName || "there";
    if (hour < 12) return `Good morning, ${name}! ☕`;
    if (hour < 17) return `Good afternoon, ${name}! 🍽️`;
    return `Good evening, ${name}! 🌙`;
  }, [user]);

  const handleSelect = async (restaurant: any) => {
    setSelectedRestaurant(restaurant.restaurants);
    setRole(restaurant.role);
    await fetchSettings(restaurant.restaurants.id);
    
    const roleMap: Record<string, string> = {
        owner: "/app/dashboard",
        admin: "/app/dashboard",
        manager: "/app/dashboard",
        waiter: "/app/dashboard",
        chef: "/app/dashboard",
        bartender: "/app/dashboard",
        cashier: "/app/dashboard",
    };

    const target = roleMap[restaurant.role.toLowerCase()] || "/app/dashboard";
    navigate(target);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === "owner") return theme.palette.success.main;
    if (r === "admin" || r === "manager") return theme.palette.primary.main;
    if (r === "chef") return theme.palette.warning.main;
    return theme.palette.secondary.main;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  } as const;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: isDark
          ? `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${theme.palette.background.default} 100%)`
          : `radial-gradient(circle at 50% 0%, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${theme.palette.background.default} 100%)`,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          p: 2,
          px: { xs: 2, md: 4 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
          zIndex: 10,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          DineMate
        </Typography>
        <IconButton 
          onClick={handleLogout} 
          sx={{ 
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
          }}
        >
          <LogoutRoundedIcon />
        </IconButton>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 8 }}>
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          textAlign="center"
          mb={8}
        >
          <Typography 
            variant="h2" 
            fontWeight={800} 
            gutterBottom
            sx={{ 
              fontSize: { xs: "2.5rem", md: "3.75rem" },
              letterSpacing: "-1px",
              color: theme.palette.text.primary
            }}
          >
            {greeting}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, opacity: 0.8 }}>
            Please select a restaurant to continue to your dashboard.
          </Typography>
        </MotionBox>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} thickness={5} />
          </Box>
        ) : (
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4} justifyContent="center">
              <AnimatePresence>
                {restaurants.map((res: any) => (
                  <Grid item xs={12} sm={6} md={4} key={res.restaurants.id}>
                    <MotionCard
                      variants={itemVariants}
                      whileHover={{ 
                        y: -10, 
                        scale: 1.02,
                        boxShadow: isDark 
                          ? `0 20px 40px ${alpha(theme.palette.common.black, 0.4)}`
                          : `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                      onClick={() => handleSelect(res)}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        background: isDark 
                          ? alpha(theme.palette.background.paper, 0.6)
                          : alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: "blur(20px)",
                        borderRadius: 6,
                        border: `1px solid ${alpha(isDark ? theme.palette.common.white : theme.palette.common.black, 0.08)}`,
                        transition: "border-color 0.3s ease",
                        '&:hover': {
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          '& .arrow-icon': {
                            transform: "translateX(5px)",
                            opacity: 1,
                          }
                        }
                      }}
                    >
                      <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flexGrow: 1 }}>
                        <Box sx={{ position: "relative", mb: 3 }}>
                          <Avatar
                            src={res.restaurants.logo}
                            sx={{
                              width: 100,
                              height: 100,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.1)}`,
                              border: `4px solid ${theme.palette.background.paper}`,
                            }}
                          >
                            <StoreRoundedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                          </Avatar>
                        </Box>

                        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, letterSpacing: "-0.5px" }}>
                          {res.restaurants.name}
                        </Typography>

                        {res.restaurants.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', opacity: 0.8 }}>
                            "{res.restaurants.description}"
                          </Typography>
                        )}

                        <Chip
                          label={res.role}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                            letterSpacing: "0.5px",
                            bgcolor: alpha(getRoleColor(res.role), 0.1),
                            color: getRoleColor(res.role),
                            border: `1px solid ${alpha(getRoleColor(res.role), 0.2)}`,
                            mb: 2
                          }}
                        />

                        {res.restaurants.address_line_1 && (
                          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, maxWidth: "80%" }}>
                            {res.restaurants.address_line_1}, {res.restaurants.city}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box 
                        sx={{ 
                          p: 2, 
                          px: 4,
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`
                        }}
                      >
                        <Typography variant="button" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontSize: "0.75rem" }}>
                          Open Dashboard
                        </Typography>
                        <ArrowForwardRoundedIcon 
                          className="arrow-icon"
                          sx={{ 
                            fontSize: 20, 
                            color: theme.palette.primary.main,
                            opacity: 0.5,
                            transition: "all 0.3s ease"
                          }} 
                        />
                      </Box>
                    </MotionCard>
                  </Grid>
                ))}

                <Grid item xs={12} sm={6} md={4}>
                  <MotionCard
                    variants={itemVariants}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.02,
                      borderColor: theme.palette.primary.main,
                      background: alpha(theme.palette.primary.main, 0.02)
                    }}
                    onClick={() => navigate("/onboarding")}
                    sx={{
                      height: "100%",
                      minHeight: 280,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      borderRadius: 6,
                      background: "transparent",
                      border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        borderRadius: "50%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mb: 2,
                        transition: "all 0.3s ease",
                      }}
                      className="add-icon-container"
                    >
                      <AddRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Add Restaurant
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Setup a new location
                    </Typography>
                  </MotionCard>
                </Grid>
              </AnimatePresence>
            </Grid>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
};

export default RestaurantSelectionPage;
