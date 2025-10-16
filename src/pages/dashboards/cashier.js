import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  AttachMoney,
  CreditCard,
  Smartphone,
  TrendingUp,
  ReceiptLong,
  Cancel,
  Insights,
  Search,
  FilterAlt,
  RestartAlt,
  FileDownload,
  ContentCopy,
  Print,
  MoreHoriz,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardHeader from "./components/dashboard-header";
import useCashierStore from "../../lib/cashierStore";
import { formatDateTime } from "../../utils/format-datetime";
import TransactionHistory from "./components/transaction-histroy";
import PaymentBreakdownChart from "./components/payment-breakdown";
import SalesTrendChart from "./components/sales-trend-chart";
import KpiDashboard from "./components/kpi-dashboard";
import CashierDashboardSkeleton from "./components/skeletons/cashier-dashboard-skeleton";

/**
 * CashierReports_Pro.jsx
 * Polished, production-ready single-file React component designed to match the
 * WaiterDashboard_Pro style and UX language. Focuses on:
 *  - Clean visual hierarchy and consistent spacing
 *  - Accessible controls and keyboard-friendly filters
 *  - Reusable components (KpiCard, CompactIcon)
 *  - Export + copy + print utilities with graceful fallbacks
 *  - Prop-driven data and sensible defaults for quick integration
 *
 * Usage:
 * <CashierReportsPro initialTransactions={...} salesData={...} />
 */

export default function CashierReportsPro({ initialTransactions, salesData }) {
  const {
    activeSessions,
    loadingActiveSessionByRestaurant,
    activeSeesionByRestaurantLoaded,
    getActiveSessionByRestaurant,
    setCashAmount,
    setCardAmount,
    setMomoAmount,
    handlePaymentMethodChange,
    cashAmount,
    cardAmount,
    momoAmount,
    paymentMethod,
    setPaymentMethod,
    setSelectedSession,
    selectedSession,
    handlePayment,
    handlePrintBill,
    closedSessions,
    allSessions,
    setSelected,
    selected,
  } = useCashierStore();

  // Filters
  const [query, setQuery] = useState("");
  const [methods, setMethods] = useState(["Cash", "Card", "Mobile"]);
  const [statuses, setStatuses] = useState(["Paid", "Refunded", "Canceled"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");

  const [transactions, setTransactions] = useState(initialTransactions);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);


  useEffect(() => {
    getActiveSessionByRestaurant();
  }, []);

  // Robust filtering (defensive with invalid dates)
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        tx.order.toLowerCase().includes(q);
      const matchesMethod = methods.includes(tx.method);
      const matchesStatus = statuses.includes(tx.status);

      let txDate = null;
      try {
        txDate = new Date(tx.date);
      } catch (e) {
        txDate = null;
      }

      const fromOk = dateFrom && txDate ? txDate >= new Date(dateFrom) : true;
      const toOk = dateTo && txDate ? txDate <= new Date(dateTo) : true;
      const amtOk =
        (minAmt === "" || tx.amount >= Number(minAmt)) &&
        (maxAmt === "" || tx.amount <= Number(maxAmt));

      return (
        matchesQuery &&
        matchesMethod &&
        matchesStatus &&
        fromOk &&
        toOk &&
        amtOk
      );
    });
  }, [
    transactions,
    query,
    methods,
    statuses,
    dateFrom,
    dateTo,
    minAmt,
    maxAmt,
  ]);

  // Aggregates
  const totals = useMemo(() => {
    const sum = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const avg = filtered.length ? sum / filtered.length : 0;
    const refunds = filtered.filter((t) => t.status === "Refunded").length;
    return { sum, count: filtered.length, avg, refunds };
  }, [filtered]);




  // Exports
  const toCSV = (rows) => {
    const headers = ["id", "order", "amount", "method", "status", "date"];
    const csvRows = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    return csvRows.join("\n");
  };

  const download = (filename, content, type = "text/csv") => {
    try {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handleExportCSV = () =>
    download("cashier-transactions.csv", toCSV(filtered));
  const handleExportJSON = () =>
    download(
      "cashier-transactions.json",
      JSON.stringify(filtered, null, 2),
      "application/json"
    );
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(toCSV(filtered));
      } else {
        const el = document.createElement("textarea");
        el.value = toCSV(filtered);
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
      }
    } catch (e) {
      console.warn("Copy failed", e);
    }
  };

  const handlePrint = () => window.print();

  const resetFilters = () => {
    setQuery("");
    setMethods(["Cash", "Card", "Mobile"]);
    setStatuses(["Paid", "Refunded", "Canceled"]);
    setDateFrom("");
    setDateTo("");
    setMinAmt("");
    setMaxAmt("");
  };

  return (
    <>
      {
        activeSeesionByRestaurantLoaded ? (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <DashboardHeader
          title="Cashier Reports"
          description="Clean, consistent view — filters on the left, visual insights on the right."
          background="linear-gradient(135deg, rgb(25, 187, 31) 0%, rgb(199, 128, 102) 100%)"
          color="#fff"
        />

        {/* KPIs + Charts */}
        <KpiDashboard allSessions={allSessions}/>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <SalesTrendChart allSessions={allSessions}/>
          </Grid>

          <Grid item xs={12} md={4}>
            <PaymentBreakdownChart allSessions={allSessions}/>
          </Grid>

          {/* Transaction Table */}
          <Grid item xs={12}>
            <TransactionHistory allSessions={allSessions} />
          </Grid>
        </Grid>

        {/* Filters */}
        {/* <Card
          sx={{ mb: 3, borderRadius: 2, border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search ID / Order"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="e.g. TX-201 or ORD-120"
                  aria-label="Search transactions"
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Select
                  fullWidth
                  multiple
                  size="small"
                  value={methods}
                  onChange={(e) =>
                    setMethods(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value
                    )
                  }
                  input={<OutlinedInput />}
                  renderValue={(selected) => selected.join(", ")}
                  aria-label="Payment methods"
                >
                  {["Cash", "Card", "Mobile"].map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} md={2}>
                <Select
                  fullWidth
                  multiple
                  size="small"
                  value={statuses}
                  onChange={(e) =>
                    setStatuses(
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value
                    )
                  }
                  input={<OutlinedInput />}
                  renderValue={(selected) => selected.join(", ")}
                  aria-label="Statuses"
                >
                  {["Paid", "Refunded", "Canceled"].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={6} md={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={6} md={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={6} md={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Min $"
                  value={minAmt}
                  onChange={(e) => setMinAmt(e.target.value)}
                />
              </Grid>

              <Grid item xs={6} md={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Max $"
                  value={maxAmt}
                  onChange={(e) => setMaxAmt(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={2} sx={{ ml: "auto" }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Reset filters">
                    <IconButton onClick={resetFilters} aria-label="Reset filters">
                      <RestartAlt />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export CSV">
                    <IconButton onClick={handleExportCSV} aria-label="Export CSV">
                      <FileDownload />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Export JSON">
                    <IconButton
                      onClick={handleExportJSON}
                      aria-label="Export JSON"
                    >
                      <FileDownload />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy CSV">
                    <IconButton onClick={handleCopy} aria-label="Copy CSV">
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print view">
                    <IconButton onClick={handlePrint} aria-label="Print">
                      <Print />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card> */}
          </Box>
        ) : (
          <CashierDashboardSkeleton />
        )}
    </>
  );
}

CashierReportsPro.propTypes = {
  initialTransactions: PropTypes.array,
  salesData: PropTypes.array,
};

CashierReportsPro.defaultProps = {
  initialTransactions: [
    {
      id: "TX-201",
      order: "ORD-120",
      amount: 25,
      method: "Cash",
      status: "Paid",
      date: "2025-08-21",
    },
    {
      id: "TX-202",
      order: "ORD-121",
      amount: 40,
      method: "Card",
      status: "Paid",
      date: "2025-08-21",
    },
    {
      id: "TX-203",
      order: "ORD-122",
      amount: 18,
      method: "Mobile",
      status: "Paid",
      date: "2025-08-22",
    },
    {
      id: "TX-204",
      order: "ORD-123",
      amount: 32,
      method: "Card",
      status: "Refunded",
      date: "2025-08-22",
    },
    {
      id: "TX-205",
      order: "ORD-124",
      amount: 58,
      method: "Cash",
      status: "Paid",
      date: "2025-08-23",
    },
    {
      id: "TX-206",
      order: "ORD-125",
      amount: 17,
      method: "Mobile",
      status: "Canceled",
      date: "2025-08-23",
    },
  ],
  salesData: [
    { day: "Mon", sales: 200 },
    { day: "Tue", sales: 300 },
    { day: "Wed", sales: 250 },
    { day: "Thu", sales: 400 },
    { day: "Fri", sales: 500 },
    { day: "Sat", sales: 600 },
    { day: "Sun", sales: 350 },
  ],
};

// internal helper to compute totals; not exported
function totalsFrom(filtered) {
  const sum = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const avg = filtered.length ? sum / filtered.length : 0;
  const refunds = filtered.filter((t) => t.status === "Refunded").length;
  return { sum, avg, refunds, count: filtered.length };
}

// expose for tests if needed
export { totalsFrom };
