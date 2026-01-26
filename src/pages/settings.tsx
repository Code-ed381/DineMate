import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{ width: "100%" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const Settings: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const { selectedRestaurant } = useRestaurantStore();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!selectedRestaurant) return null;

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        p: 2,
        minHeight: "80vh"
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{ borderRight: 1, borderColor: "divider", minWidth: 200 }}
      >
        <Tab label="Restaurant Info" {...a11yProps(0)} />
        <Tab label="General" {...a11yProps(1)} />
        <Tab label="Employees" {...a11yProps(2)} />
        <Tab label="Tables" {...a11yProps(3)} />
        <Tab label="Menu" {...a11yProps(4)} />
        <Tab label="Reports" {...a11yProps(5)} />
        <Tab label="Kitchen" {...a11yProps(6)} />
        <Tab label="Dashboard" {...a11yProps(7)} />
        <Tab label="Security" {...a11yProps(8)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <RestaurantDetailsPanel restaurant={selectedRestaurant.restaurants} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <GeneralSettingsPanel />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <EmployeesPanel />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <TablesPanel />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <MenuPanel />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <ReportsSettingsPanel />
      </TabPanel>
      <TabPanel value={value} index={6}>
        <KitchenSettingsPanel />
      </TabPanel>
      <TabPanel value={value} index={7}>
        <DashboardSettingsPanel />
      </TabPanel>
      <TabPanel value={value} index={8}>
        <SecuritySettingsPanel />
      </TabPanel>
    </Box>
  );
};

export default Settings;
