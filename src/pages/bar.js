import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider
} from "@mui/material";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import useBarStore from "../lib/barStore";
import OTCTabs from "../components/bar-over-the-counter-section";
import BigOptionButtons from "../components/bar-option-buttons";
import BartenderDineInPanel from "../components/bartender-dine-in-panel";

const activeOrders = [
  {
    id: "ORD-201",
    drinks: ["Mojito", "Whiskey Sour"],
    source: "Waiter Sarah (Table 12)",
    time: "2 mins ago",
    status: "Pending",
  },
  {
    id: "ORD-202",
    drinks: ["Martini"],
    source: "POS - Counter",
    time: "1 min ago",
    status: "Pending",
  },
];

const readyOrders = [
  {
    id: "ORD-198",
    drinks: ["Beer Pint"],
    source: "Waiter John (Table 7)",
    time: "5 mins ago",
    status: "Ready",
  },
];

const completedOrders = [
  { id: "ORD-190", drinks: ["Margarita"], time: "15 mins ago" },
  { id: "ORD-189", drinks: ["Old Fashioned"], time: "20 mins ago" },
];

export default function BartenderPanel() {
  const [orders, setOrders] = useState(activeOrders);
  const { items, handleFetchItems, barOptionSelected } = useBarStore();

  useEffect(() => {
    handleFetchItems();
  }, []);

  const markAsReady = (id) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setOrders(orders.filter((o) => o.id !== id));
      readyOrders.push({ ...order, status: "Ready" });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        {/* Left: Icon + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LocalBarIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
            >
              Bar Panel
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Manage drinks • Track status • Stay efficient
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Big Option Buttons */}
      <BigOptionButtons />

      {/* Dine In Panel */}
      {barOptionSelected === "dine_in" && <BartenderDineInPanel />}

      {/* Takeaway Panel */}
      {barOptionSelected === "takeaway" && <OTCTabs />}
    </Box>
  );
}
