import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useAuthStore from "../lib/authStore";
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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const Settings = () => {
  const [value, setValue] = React.useState(0);
  const { user } = useAuthStore();
  const { selectedRestaurant } = useRestaurantStore();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "background.paper",
        display: "flex",
        p: 9,
      }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: "divider" }}
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
