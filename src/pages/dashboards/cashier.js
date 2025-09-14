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
import DashboardHeader from "../../components/dashboard-header";

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

const COLORS = ["#4caf50", "#2196f3", "#ff9800"];

function CompactIcon({ children }) {
  return (
    <Box
      component="span"
      sx={{
        width: 36,
        height: 36,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        background: "rgba(0,0,0,0.03)",
      }}
      aria-hidden
    >
      {children}
    </Box>
  );
}

CompactIcon.propTypes = { children: PropTypes.node };

function KpiCard({ icon, title, value, note }) {
  return (
    <Card sx={{ borderRadius: 2, height: "100%" }} elevation={1}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          {icon}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {note && (
              <Typography variant="caption" color="text.secondary">
                {note}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

KpiCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  note: PropTypes.string,
};

export default function CashierReportsPro({ initialTransactions, salesData }) {
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

  const paymentBreakdown = useMemo(() => {
    const map = { Cash: 0, Card: 0, Mobile: 0 };
    filtered.forEach(
      (t) => (map[t.method] = (map[t.method] || 0) + (Number(t.amount) || 0))
    );
    return [
      { name: "Cash", value: map.Cash },
      { name: "Card", value: map.Card },
      { name: "Mobile", value: map.Mobile },
    ];
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <DashboardHeader
        title="Cashier Reports"
        description="Clean, consistent view — filters on the left, visual insights on the right."
        background="linear-gradient(135deg, rgb(25, 187, 31) 0%, rgb(199, 128, 102) 100%)"
        color="#fff"
      />
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <CompactIcon>
          <Insights sx={{ color: "primary.main" }} />
        </CompactIcon>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Cashier Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clean, consistent view — filters on the left, visual insights on the
            right.
          </Typography>
        </Box>
      </Stack>

      {/* Filters */}
      <Card
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
      </Card>

      {/* KPIs + Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <KpiCard
            icon={
              <CompactIcon>
                <TrendingUp />
              </CompactIcon>
            }
            title="Total Sales"
            value={`$${totals.sum.toFixed(2)}`}
            note={`Count: ${totals.count}`}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <KpiCard
            icon={
              <CompactIcon>
                <ReceiptLong />
              </CompactIcon>
            }
            title="Transactions"
            value={totals.count}
            note={`Avg: $${totals.avg.toFixed(2)}`}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <KpiCard
            icon={
              <CompactIcon>
                <AttachMoney />
              </CompactIcon>
            }
            title="Avg Order"
            value={`$${totals.avg.toFixed(2)}`}
            note={
              totals.count
                ? `${(totals.sum / totals.count).toFixed(2)} avg`
                : "—"
            }
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <KpiCard
            icon={
              <CompactIcon>
                <Cancel />
              </CompactIcon>
            }
            title="Refunds"
            value={totals.refunds}
            note="Please review"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Sales Trend
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <RTooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#1976d2"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Payment Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={36}
                    label
                  >
                    {paymentBreakdown.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <FilterAlt color="primary" />
                <Typography variant="h6">Transaction History</Typography>
                <Box sx={{ flex: 1 }} />
                <Button variant="text" startIcon={<MoreHoriz />}>
                  Advanced
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Table
                size="small"
                sx={{ borderCollapse: "separate", borderSpacing: 0 }}
              >
                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((tx, idx) => (
                    <TableRow
                      key={tx.id}
                      sx={{
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                      }}
                    >
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{tx.order}</TableCell>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell align="right">
                        ${Number(tx.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {tx.method === "Cash" && (
                          <Chip
                            icon={<AttachMoney />}
                            label="Cash"
                            size="small"
                          />
                        )}
                        {tx.method === "Card" && (
                          <Chip
                            icon={<CreditCard />}
                            label="Card"
                            size="small"
                          />
                        )}
                        {tx.method === "Mobile" && (
                          <Chip
                            icon={<Smartphone />}
                            label="Mobile"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          color={
                            tx.status === "Paid"
                              ? "success"
                              : tx.status === "Refunded"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ color: "text.secondary", py: 6 }}
                      >
                        No transactions match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
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
