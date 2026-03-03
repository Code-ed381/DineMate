import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import Box from "@mui/material/Box";
import { useTheme, useMediaQuery } from "@mui/material";
import useRestaurantStore from "../lib/restaurantStore";
import RestaurantDetailsPanel from "./settingsTabs/restaurantDetails";
import EmployeesPanel from "./settingsTabs/employees";
import TablesPanel from "./settingsTabs/tables";
import MenuPanel from "./settingsTabs/menu";
import ReportsSettingsPanel from "./settingsTabs/reports";
import KitchenSettingsPanel from "./settingsTabs/kitchen";
import DashboardSettingsPanel from "./settingsTabs/dashboard";
import SecuritySettingsPanel from "./settingsTabs/security";
import GeneralSettingsPanel from "./settingsTabs/general";
import SubscriptionSettingsPanel from "./settingsTabs/subscription";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  isMobile: boolean;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, isMobile, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      style={{ width: "100%" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    "aria-controls": `settings-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const { selectedRestaurant } = useRestaurantStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!selectedRestaurant) return null;

  const tabLabels = [
    "Restaurant Info", "General", "Employees", "Tables", "Menu",
    "Reports", "Kitchen", "Dashboard", "Security", "Subscription"
  ];

  const tabPanels = [
    <RestaurantDetailsPanel />,
    <GeneralSettingsPanel />,
    <EmployeesPanel />,
    <TablesPanel />,
    <MenuPanel />,
    <ReportsSettingsPanel />,
    <KitchenSettingsPanel />,
    <DashboardSettingsPanel />,
    <SecuritySettingsPanel />,
    <SubscriptionSettingsPanel />,
  ];

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        p: isMobile ? 1 : 2,
        minHeight: "80vh"
      }}
    >
      <Tabs
        orientation={isMobile ? "horizontal" : "vertical"}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        value={value}
        onChange={handleChange}
        sx={{
          ...(isMobile
            ? {
                borderBottom: 1,
                borderColor: "divider",
                mb: 1,
                '& .MuiTab-root': { minWidth: 'auto', px: 2, fontSize: '0.8rem' },
              }
            : {
                borderRight: 1,
                borderColor: "divider",
                minWidth: 200,
              }),
        }}
      >
        {tabLabels.map((label, i) => (
          <Tab key={i} label={label} {...a11yProps(i)} />
        ))}
      </Tabs>
      {tabPanels.map((panel, i) => (
        <TabPanel key={i} value={value} index={i} isMobile={isMobile}>
          {panel}
        </TabPanel>
      ))}
    </Box>
  );
};

export default Settings;
