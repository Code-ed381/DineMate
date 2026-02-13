import { Outlet } from "react-router-dom";
import * as React from "react";
import {
  styled,
  useTheme,
  alpha,
} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import dayjs from "dayjs";



// Icons
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SettingsIcon from "@mui/icons-material/Settings";
import CachedIcon from "@mui/icons-material/Cached";

import { MainListItems, SecondaryListItems } from "./list-items";
import TooltipComponent from "../../components/tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import useDashboardStore from "../../lib/dashboardStore";
import useAuthStore from "../../lib/authStore";
import useAppStore from "../../lib/appstore";
import useRestaurantStore from "../../lib/restaurantStore";
import ThemeToggle from "../../components/theme-toggle";
import { useSettings } from "../../providers/settingsProvider";
import { ToastContainer } from "react-toastify";
import NotificationList from "../../components/notifications";
import useNotificationStore from "../../lib/notificationStore";
import CommandPalette from "../../components/command-palette";
import Chip from "@mui/material/Chip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { motion, AnimatePresence } from "framer-motion";

function Copyright(props: any) {
  return (
    <Typography variant="body2" color="inherit" align="center" {...props}>
      {"© "}
      {new Date().getFullYear()}{" "}
      <Link
        href="https://cyaneltechnologies.com/"
        underline="hover"
      >
        BueTech IT Solutions
      </Link>
      {". Developed in Accra, Ghana."}
    </Typography>
  );
}

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})<AppBarProps & { isMobile?: boolean }>(({ theme, open, isMobile }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  backdropFilter: 'blur(12px)',
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: 'none',
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && !isMobile && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { breadcrumb, setBreadcrumb } = useAppStore();
  const {
    getRestaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    setRole,
    restaurants,
    role,
  } = useRestaurantStore();
  const { settings } = useSettings() as any;
  const { 
    notifications, 
    setNotifications, 
    subscribeToNotifications, 
    unsubscribe, 
    fetchNotifications,
    deleteNotification,
    clearAllNotifications
  } = useNotificationStore();
  const isOnline = useOnlineStatus();

  const { fetchUser } = useDashboardStore();
  const { signOut, user } = useAuthStore();

  const first_name = user?.user_metadata?.firstName || "";
  const last_name = user?.user_metadata?.lastName || "";


  useEffect(() => {
    if (!user?.id || !selectedRestaurant?.id) {
      console.warn('⏸️  Waiting for user and restaurant data before initializing notifications...');
      return;
    }

    console.log('🔔 Initializing notification system', {
      userId: user.id,
      restaurantId: selectedRestaurant.id
    });
    
    fetchNotifications();
    subscribeToNotifications();

    return () => {
      console.log('🔕 Unsubscribing from notifications');
      unsubscribe();
    };
  }, [user?.id, selectedRestaurant?.id, fetchNotifications, subscribeToNotifications, unsubscribe]);

  useEffect(() => {
    if (user?.id) {
        getRestaurants();
    }
  }, [getRestaurants, user?.id]);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (restaurants.length === 1 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].restaurants);
      setRole(restaurants[0].role);
    }
  }, [restaurants, selectedRestaurant, setSelectedRestaurant, setRole]);

  const formatDate = (date: Date) => {
    return dayjs(date).format("ddd, DD MMMM YYYY, h:mm:ss A");
  };




  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const navigate = useNavigate();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleListItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const logout = async () => { 
    signOut();
    localStorage.clear();
    localStorage.removeItem("auth-store");
    localStorage.removeItem("restaurant-store");
    setSelectedRestaurant(null);
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if inside an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          setAnchorEl(document.querySelector('[aria-label="show notifications"]') as HTMLElement);
          break;
        case "t":
          if (role === "waiter" || role === "owner" || role === "admin") {
            navigate("/app/tables");
            setBreadcrumb("Tables");
          }
          break;
        case "m":
          if (role === "waiter" || role === "owner" || role === "admin") {
            navigate("/app/menu");
            setBreadcrumb("Menu");
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, setBreadcrumb, role]);

  const handleClearAll = async () => {
    if (user?.id && selectedRestaurant?.id) {
      await clearAllNotifications(user.id, selectedRestaurant.id);
      handleClose();
    }
  };

  const UserProfileCard = ({ collapsed }: { collapsed?: boolean }) => (
    <Box sx={{ 
      p: 2, 
      mt: 'auto', 
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      bgcolor: alpha(theme.palette.action.hover, 0.04)
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexDirection: collapsed ? 'column' : 'row',
        textAlign: collapsed ? 'center' : 'left'
      }}>
        <Avatar
          src={user?.user_metadata?.profileAvatar}
          alt={first_name}
          sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.primary.main}` }}
        />
        {!collapsed && (
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                {first_name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
                v1.2.0
              </Typography>
            </Box>
            <Chip 
              label={role?.toUpperCase()} 
              size="small" 
              color="primary" 
              variant="filled"
              sx={{ 
                height: 18, 
                fontSize: '0.65rem', 
                fontWeight: 900,
                mt: 0.5
              }} 
            />
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {selectedRestaurant && (
        <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
          <CssBaseline />

          <AppBar position="fixed" open={open} {...{ isMobile } as any}>
            <Toolbar sx={{ pr: isSmallMobile ? "10px" : "20px" }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: isSmallMobile ? "10px" : "30px",
                  ...(open && !isMobile && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>

              <Avatar
                src={selectedRestaurant?.logo}
                alt={selectedRestaurant?.name}
                variant="rounded"
                sx={{ 
                  height: 40, 
                  width: 40, 
                  mr: 2, 
                  bgcolor: 'primary.main',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {selectedRestaurant?.name?.charAt(0)}
              </Avatar>

              <Typography
                component="h1"
                variant={isSmallMobile ? "h6" : "h5"}
                color="inherit"
                noWrap
                sx={{ mr: 1, fontWeight: "900", flexShrink: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {selectedRestaurant?.name}
                {!isSmallMobile && (
                  <Chip 
                    label={role} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }} 
                  />
                )}
              </Typography>

              {!isSmallMobile && (
                <Box sx={{ mx: "auto", display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                    <Box 
                      sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: isOnline ? 'success.main' : 'error.main',
                        boxShadow: `0 0 8px ${isOnline ? theme.palette.success.main : theme.palette.error.main}`
                      }} 
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto' }} />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: "700" }}
                    noWrap
                  >
                    {settings?.general?.show_date_and_time_on_navbar &&
                      formatDate(currentTime)}
                  </Typography>
                </Box>
              )}

              {isSmallMobile && <Box sx={{ flexGrow: 1 }} />}

              {settings?.general?.show_light_night_toggle && <ThemeToggle />}

              {restaurants.length > 1 && (
                <TooltipComponent title="Switch Restaurant">
                  <IconButton
                    size="large"
                    aria-label="switch restaurant"
                    color="inherit"
                    onClick={() => navigate("/restaurant-selection")}
                  >
                    <CachedIcon />
                  </IconButton>
                </TooltipComponent>
              )}

              {settings?.general?.allow_notifications && (
                <IconButton
                  size="large"
                  aria-label="show notifications"
                  color="inherit"
                  onClick={handleClick}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}

              <NotificationList
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                notifications={notifications}
                onDelete={handleDelete}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAll}
              />

              <Box sx={{ flexGrow: 0 }}>
                <TooltipComponent title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt="User Avatar"
                      src={user?.user_metadata?.profileAvatar}
                    />
                  </IconButton>
                </TooltipComponent>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem disabled>
                    <Typography
                      variant="subtitle1"
                      color="inherit"
                      sx={{ fontWeight: "900" }}
                      noWrap
                    >
                      {first_name + " " + last_name}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("dashboard");
                    }}
                  >
                    <DashboardIcon sx={{ mr: 1 }} />
                    <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("profile");
                      setBreadcrumb("Profile");
                    }}
                  >
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography textAlign="center">Profile</Typography>
                  </MenuItem>
                    {role === "owner" && (
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu();
                        navigate("settings");
                        setBreadcrumb("Settings");
                      }}
                    >
                      <SettingsIcon sx={{ mr: 1 }} />
                      <Typography textAlign="center">Settings</Typography>
                    </MenuItem>
                  )}
                  <Divider component="li" />
                  <MenuItem onClick={logout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>
          {/* Mobile Drawer */}
          <MuiDrawer
            variant="temporary"
            open={isMobile && open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav" onClick={handleListItemClick} sx={{ pt: 0 }}>
              <MainListItems drawerOpen={true} />
              <Divider sx={{ my: 1 }} />
              <SecondaryListItems drawerOpen={true} />
            </List>
            <UserProfileCard />
          </MuiDrawer>

          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              display: { xs: "none", md: "block" },
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav" sx={{ pt: 0 }}>
              <MainListItems drawerOpen={open} />
              <Divider sx={{ my: 1 }} />
              <SecondaryListItems drawerOpen={open} />
            </List>
            <UserProfileCard collapsed={!open} />
          </Drawer>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: "auto",
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Toolbar />
            
            {/* Sub-header for Breadcrumbs */}
            {settings?.general?.show_breadcrumb && (
              <Box sx={{ 
                px: 3, 
                py: 1, 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`, 
                bgcolor: alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(10px)'
              }}>
                <Breadcrumbs 
                  separator={<Typography variant="caption" color="text.disabled">/</Typography>}
                  aria-label="breadcrumb"
                >
                  <Link 
                    component="button"
                    variant="caption"
                    onClick={() => navigate('/app/dashboard')}
                    sx={{ color: 'text.secondary', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    HOME
                  </Link>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>
                    {breadcrumb?.toUpperCase()}
                  </Typography>
                </Breadcrumbs>
              </Box>
            )}

            <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={breadcrumb}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
              <ToastContainer />
            </Box>
            <CommandPalette />
            <Copyright sx={{ py: 4 }} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default Layout;
