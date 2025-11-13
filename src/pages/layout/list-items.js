import * as React from "react";
import { Link } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import useAppStore from "../../lib/appstore";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import useRestaurantStore from "../../lib/restaurantStore";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import SettingsIcon from "@mui/icons-material/Settings";
import {useSettings} from "../../providers/settingsProvider";

export const MainListItems = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const { setBreadcrumb } = useAppStore();

  return (
    <React.Fragment>
        <Link
          to="/app/dashboard"
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={() => setBreadcrumb("Dashboard")}
        >
          <ListItemButton>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </Link>
      {selectedRestaurant.role === "waiter" && (
        <>
            <Link
              to="/app/menu"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => setBreadcrumb("Menu")}
            >
              <ListItemButton>
                <ListItemIcon>
                  <MenuBookIcon />
                </ListItemIcon>
                <ListItemText primary="Menu" />
              </ListItemButton>
            </Link>
            <Link
              to="/app/tables"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => setBreadcrumb("Tables")}
            >
              <ListItemButton>
                <ListItemIcon>
                  <TableRestaurantIcon />
                </ListItemIcon>
                <ListItemText primary="Tables" />
              </ListItemButton>
            </Link>
        </>
      )}
      {selectedRestaurant.role === "bartender" && (
        <>
            <Link
              to="/app/bar"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => setBreadcrumb("Menu")}
            >
              <ListItemButton>
                <ListItemIcon>
                  <LocalBarIcon />
                </ListItemIcon>
                <ListItemText primary="Bar" />
              </ListItemButton>
            </Link>
        </>
      )}
      {selectedRestaurant.role === "chef" && (
          <Link
            to="/app/kitchen"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Kitchen")}
          >
            <ListItemButton>
              <ListItemIcon>
                <SoupKitchenIcon />
              </ListItemIcon>
              <ListItemText primary="Kitchen" />
            </ListItemButton>
          </Link>
      )}
      {selectedRestaurant.role === "cashier" && (
          <Link
            to="/app/cashier"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Cashier")}
          >
            <ListItemButton>
              <ListItemIcon>
                <PriceCheckIcon />
              </ListItemIcon>
              <ListItemText primary="Cashier" />
            </ListItemButton>
          </Link>
      )}
    </React.Fragment>
  );
};

export const SecondaryListItems = () => {
  const { setBreadcrumb } = useAppStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { settings } = useSettings();

  return (
    <React.Fragment>
      {(selectedRestaurant.role === "owner" ||
        selectedRestaurant.role === "admin") && (
        <>
          <Link
            to="/app/employees"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Employees Management")}
          >
            <ListItemButton>
              <ListItemIcon>
                <PeopleAltIcon />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>
          </Link>
          <Link
            to="/app/menu-items-management"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Items Management")}
          >
            <ListItemButton>
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="Menu Items" />
            </ListItemButton>
          </Link>
          <Link
            to="/app/tables-management"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Tables Management")}
          >
            <ListItemButton>
              <ListItemIcon>
                <TableRestaurantIcon />
              </ListItemIcon>
              <ListItemText primary="Tables" />
            </ListItemButton>
          </Link>
        </>
      )}

      {selectedRestaurant.role === "owner" ? (
        <>
          <Link
            to="/app/report"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Reports")}
          >
            <ListItemButton>
              <ListItemIcon>
                <TrendingUpIcon />
              </ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItemButton>
          </Link>
        </>
      ) : (
          <>
            {(selectedRestaurant.role === "admin" && settings?.employee_permissions?.admins_view_report) ? (
              <>
                <Link
                  to="/app/report"
                  style={{ textDecoration: "none", color: "inherit" }}
                  onClick={() => setBreadcrumb("Reports")}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <TrendingUpIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                  </ListItemButton>
                </Link>
              </>
            ) : null}
        </>
      )}

      {(selectedRestaurant.role === "owner" ||
        selectedRestaurant.role === "admin") && (
        <>
          <Link
            to="/app/settings"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={() => setBreadcrumb("Settings")}
          >
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </Link>
        </>
      )}
    </React.Fragment>
  );
};
