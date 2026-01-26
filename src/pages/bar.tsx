import React, { useEffect } from "react";
import { Box } from "@mui/material";
import useBarStore from "../lib/barStore";
import OTCTabs from "../components/bar-over-the-counter-section";
import BigOptionButtons from "../components/bar-option-buttons";
import BartenderDineInPanel from "../components/bartender-dine-in-panel";

const BartenderPanel: React.FC = () => {
  const { handleFetchItems, barOptionSelected } = useBarStore();

  useEffect(() => {
    handleFetchItems();
  }, [handleFetchItems]);

  return (
    <Box sx={{ p: 3 }}>
      <BigOptionButtons />
      
      {barOptionSelected === "dine_in" && <BartenderDineInPanel />}
      {barOptionSelected === "takeaway" && <OTCTabs />}
    </Box>
  );
};

export default BartenderPanel;
