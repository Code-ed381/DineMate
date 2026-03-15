import React, { useEffect } from "react";
import { Box } from "@mui/material";
import useBarStore from "../lib/barStore";
import useAppStore from "../lib/appstore";
import OTCTabs from "../components/bar-over-the-counter-section";
import BigOptionButtons from "../components/bar-option-buttons";
import BartenderDineInPanel from "../components/bartender-dine-in-panel";
import { useSettings } from "../providers/settingsProvider";

const BartenderPanel: React.FC = () => {
  const { handleFetchItems, barOptionSelected, setBarOptionSelected } = useBarStore();
  const { setBreadcrumb } = useAppStore();
  const { settings } = useSettings();
  const bs = (settings as any).bar_settings || {};

  useEffect(() => {
    setBreadcrumb("Bar");
  }, [setBreadcrumb]);

  // Sync default mode once settings load
  useEffect(() => {
    if (bs.default_mode) {
      setBarOptionSelected(bs.default_mode);
    }
  }, [bs.default_mode]);

  useEffect(() => {
    handleFetchItems();
  }, [handleFetchItems]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <BigOptionButtons
        enableDineIn={bs.enable_dine_in ?? true}
        enableTakeaway={bs.enable_takeaway ?? true}
      />
      <Box sx={{ mt: { xs: 2.5, md: 2 } }}>
        {barOptionSelected === "dine_in" && (bs.enable_dine_in ?? true) && <BartenderDineInPanel />}
        {barOptionSelected === "takeaway" && (bs.enable_takeaway ?? true) && <OTCTabs />}
      </Box>
    </Box>
  );
};

export default BartenderPanel;
