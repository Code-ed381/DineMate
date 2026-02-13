import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import useAppStore from "../../lib/appstore";
import useRestaurantStore from "../../lib/restaurantStore";
import { useSettings } from "../../providers/settingsProvider";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  drawerOpen?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick, drawerOpen }) => {
  const location = useLocation();
  const theme = useTheme();
  const isActive = location.pathname === to;

  const content = (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }} onClick={onClick}>
      <ListItemButton
        selected={isActive}
        sx={{
          py: 1.5,
          px: 2.5,
          mx: 1,
          borderRadius: 2,
          mb: 0.5,
          transition: 'all 0.2s ease',
          justifyContent: drawerOpen ? 'initial' : 'center',
          '&.Mui-selected': {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
            },
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.main,
            },
          },
          '&:hover': {
            bgcolor: alpha(theme.palette.action.hover, 0.04),
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon 
          sx={{ 
            minWidth: 0, 
            mr: drawerOpen ? 2 : 'auto', 
            justifyContent: 'center',
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          sx={{ 
            opacity: drawerOpen ? 1 : 0,
            '& .MuiTypography-root': {
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.9rem',
            }
          }} 
        />
      </ListItemButton>
    </Link>
  );

  if (!drawerOpen) {
    return (
      <Tooltip title={label} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

export const MainListItems: React.FC<{ drawerOpen?: boolean }> = ({ drawerOpen }) => {
  const { role }: any = useRestaurantStore();
  const { setBreadcrumb }: any = useAppStore();

  return (
    <React.Fragment>
      <NavItem 
        to="/app/dashboard" 
        icon={<DashboardIcon />} 
        label="Dashboard" 
        onClick={() => setBreadcrumb("Dashboard")} 
        drawerOpen={drawerOpen}
      />
      {role === "waiter" && (
        <>
          <NavItem 
            to="/app/menu" 
            icon={<MenuBookIcon />} 
            label="Menu" 
            onClick={() => setBreadcrumb("Menu")} 
            drawerOpen={drawerOpen}
          />
          <NavItem 
            to="/app/tables" 
            icon={<TableRestaurantIcon />} 
            label="Tables" 
            onClick={() => setBreadcrumb("Tables")} 
            drawerOpen={drawerOpen}
          />
          <NavItem 
            to="/app/order-history" 
            icon={<ReceiptLongIcon />} 
            label="History" 
            onClick={() => setBreadcrumb("Order History")} 
            drawerOpen={drawerOpen}
          />
        </>
      )}
      {role === "bartender" && (
        <NavItem 
          to="/app/bar" 
          icon={<LocalBarIcon />} 
          label="Bar" 
          onClick={() => setBreadcrumb("Menu")} 
          drawerOpen={drawerOpen}
        />
      )}
      {role === "chef" && (
        <NavItem 
          to="/app/kitchen" 
          icon={<SoupKitchenIcon />} 
          label="Kitchen" 
          onClick={() => setBreadcrumb("Kitchen")} 
          drawerOpen={drawerOpen}
        />
      )}
      {role === "cashier" && (
        <>
          <NavItem 
            to="/app/cashier" 
            icon={<PriceCheckIcon />} 
            label="Cashier" 
            onClick={() => setBreadcrumb("Cashier")} 
            drawerOpen={drawerOpen}
          />
          <NavItem 
            to="/app/cashier-reports" 
            icon={<AssessmentIcon />} 
            label="Audit Logs" 
            onClick={() => setBreadcrumb("Detailed Reports")} 
            drawerOpen={drawerOpen}
          />
        </>
      )}
    </React.Fragment>
  );
};

export const SecondaryListItems: React.FC<{ drawerOpen?: boolean }> = ({ drawerOpen }) => {
  const { setBreadcrumb }: any = useAppStore();
  const { role }: any = useRestaurantStore();
  const { settings }: any = useSettings();

  const isOwnerOrAdmin = role === "owner" || role === "admin";

  return (
    <React.Fragment>
      {isOwnerOrAdmin && (
        <>
          <NavItem 
            to="/app/employees" 
            icon={<PeopleAltIcon />} 
            label="Employees" 
            onClick={() => setBreadcrumb("Employees Management")} 
            drawerOpen={drawerOpen}
          />
          <NavItem 
            to="/app/menu-items-management" 
            icon={<MenuBookIcon />} 
            label="Menu Items" 
            onClick={() => setBreadcrumb("Items Management")} 
            drawerOpen={drawerOpen}
          />
          <NavItem 
            to="/app/tables-management" 
            icon={<TableRestaurantIcon />} 
            label="Tables" 
            onClick={() => setBreadcrumb("Tables Management")} 
            drawerOpen={drawerOpen}
          />
        </>
      )}
      {(role === "owner" || (role === "admin" && settings?.employee_permissions?.admins_view_report)) && (
        <>
          <NavItem 
            to="/app/report" 
            icon={<TrendingUpIcon />} 
            label="Reports" 
            onClick={() => setBreadcrumb("Reports")} 
            drawerOpen={drawerOpen}
          />
          <NavItem 
            to="/app/cashier-reports" 
            icon={<AssessmentIcon />} 
            label="Audit Logs" 
            onClick={() => setBreadcrumb("Detailed Reports")} 
            drawerOpen={drawerOpen}
          />
        </>
      )}
      {isOwnerOrAdmin && (
        <NavItem 
          to="/app/settings" 
          icon={<SettingsIcon />} 
          label="Settings" 
          onClick={() => setBreadcrumb("Settings")} 
          drawerOpen={drawerOpen}
        />
      )}
    </React.Fragment>
  );
};

