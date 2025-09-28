// OrdersServedPerformance.jsx
import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Stack,
  Button,
  Divider,
  MenuItem,
  Typography,
  Box,
  Paper,
  Avatar,
} from "@mui/material";
import TimerTwoToneIcon from "@mui/icons-material/TimerTwoTone";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DataGrid } from "@mui/x-data-grid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import useKitchenStore from "../../../lib/kitchenStore";

/* -------------------------
   Helpers (date + grouping)
   ------------------------- */

function toISODateLocal(dateInput) {
  // returns YYYY-MM-DD in local timezone for grouping by day (stable)
  const d = new Date(dateInput);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().split("T")[0];
}

function weekdayName(date) {
  return new Date(date).toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue...
}

function monthNameMonthIndex(idx) {
  return new Date(2020, idx, 1).toLocaleString(undefined, { month: "short" }); // Jan...
}

function startOfWeek(date) {
  // Monday as start of week
  const d = new Date(date);
  const day = d.getDay(); // Sun=0..Sat=6
  const diff = (day + 6) % 7; // days from Monday
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  return s;
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function weekIndexInMonth(date) {
  // returns 1-based week index within its month (week groups starting Monday)
  const d = new Date(date);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  // compute offset in days from Monday for first day of month
  const firstDayWeekday = (first.getDay() + 6) % 7; // 0=Mon
  const dayOfMonth = d.getDate();
  return Math.ceil((firstDayWeekday + dayOfMonth) / 7);
}

/* -------------------------
   Component
   ------------------------- */

export default function OrdersServedPerformance() {
  const { orderItems = [] } = useKitchenStore(); // expecting the "order_items_full" rows
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD string
  const [period, setPeriod] = useState("week"); // 'day'|'week'|'month'|'year'|'all'

  // Only served items (defensive)
  const servedItems = useMemo(
    () =>
      (orderItems || []).filter(
        (it) => (it?.item_status || "").toLowerCase() === "served"
      ),
    [orderItems]
  );

  // summary totals for current filter (computed later)
  // Build aggregated data for chart when no selectedDate (chart mode)
  const chartData = useMemo(() => {
    if (!servedItems.length) return [];

    // Helper: sum quantity per key
    const add = (acc, key, qty = 1) => {
      if (!acc[key]) acc[key] = { key, served: 0 };
      acc[key].served += qty;
    };

    // chart by period:
    // week => days of current week (or week of today)
    // month => weeks-of-month for a reference month (current month)
    // year => months of year (Jan..Dec for a reference year)
    // all => years

    const now = new Date();
    const ref = selectedDate ? new Date(selectedDate) : now;

    if (period === "week") {
      // construct 7 day buckets for the week containing ref
      const start = startOfWeek(ref);
      const buckets = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = toISODateLocal(d);
        buckets[key] = { label: weekdayName(d), key, served: 0 };
      }
      servedItems.forEach((it) => {
        const k = toISODateLocal(it.item_created_at);
        if (k in buckets) {
          buckets[k].served += it.quantity || 1;
        }
      });
      return Object.values(buckets); // ordered Mon..Sun
    }

    if (period === "month") {
      // weeks of the month containing ref
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const days = daysInMonth(year, month);
      // determine number of weeks (1..5)
      // produce buckets labelled 'Week 1', 'Week 2' ...
      const buckets = {};
      // map each day of month to its week index
      for (let d = 1; d <= days; d++) {
        const dateObj = new Date(year, month, d);
        const wk = weekIndexInMonth(dateObj);
        const key = `week-${wk}`;
        if (!buckets[key])
          buckets[key] = { label: `Week ${wk}`, key, served: 0 };
      }
      servedItems.forEach((it) => {
        const dt = new Date(it.item_created_at);
        if (dt.getFullYear() === year && dt.getMonth() === month) {
          const wk = weekIndexInMonth(dt);
          buckets[`week-${wk}`].served += it.quantity || 1;
        }
      });
      // sort by week index
      return Object.keys(buckets)
        .sort((a, b) => {
          const wa = Number(a.split("-")[1]);
          const wb = Number(b.split("-")[1]);
          return wa - wb;
        })
        .map((k) => buckets[k]);
    }

    if (period === "year") {
      const year = ref.getFullYear();
      const buckets = {};
      for (let m = 0; m < 12; m++) {
        const label = monthNameMonthIndex(m);
        const key = `month-${m}`;
        buckets[key] = { label, key, served: 0 };
      }
      servedItems.forEach((it) => {
        const dt = new Date(it.item_created_at);
        if (dt.getFullYear() === year) {
          const k = `month-${dt.getMonth()}`;
          buckets[k].served += it.quantity || 1;
        }
      });
      return Object.keys(buckets).map((k) => buckets[k]);
    }

    // all => group by year
    {
      const buckets = {};
      servedItems.forEach((it) => {
        const y = new Date(it.item_created_at).getFullYear();
        const key = `y-${y}`;
        if (!buckets[key]) buckets[key] = { label: `${y}`, key, served: 0 };
        buckets[key].served += it.quantity || 1;
      });
      // sort by year ascending
      return Object.keys(buckets)
        .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]))
        .map((k) => buckets[k]);
    }
  }, [servedItems, period, selectedDate]);

  // If user selected a single date -> show table of items for that day
  const dayItems = useMemo(() => {
    if (!selectedDate) return [];
    return servedItems.filter(
      (it) => toISODateLocal(it.item_created_at) === selectedDate
    );
  }, [servedItems, selectedDate]);

  // summary totals (either for table or chart scope)
  const summary = useMemo(() => {
    if (selectedDate) {
      const total = dayItems.reduce((s, it) => s + (it.quantity || 1), 0);
      const revenue = dayItems.reduce(
        (s, it) => s + (it.item_price || 0) * (it.quantity || 1),
        0
      );
      return { total, revenue };
    }
    const total = chartData.reduce((s, b) => s + (b.served || 0), 0);
    // Revenue for chart scope: sum of served items that fall inside chart buckets
    // For simplicity show revenue across servedItems filtered by current period when selectedDate is not set.
    let revenue = 0;
    if (
      period === "week" ||
      period === "month" ||
      period === "year" ||
      period === "all"
    ) {
      // compute revenue for items included in chartData:
      // build set of keys in chartData and sum items that map to those keys
      const keys = new Set(chartData.map((d) => d.key));
      servedItems.forEach((it) => {
        let key;
        if (period === "week") key = toISODateLocal(it.item_created_at);
        else if (period === "month") {
          const dt = new Date(it.item_created_at);
          const wk = weekIndexInMonth(dt);
          key = `week-${wk}`;
          const ref = selectedDate ? new Date(selectedDate) : new Date();
          if (
            !(
              dt.getFullYear() === ref.getFullYear() &&
              dt.getMonth() === ref.getMonth()
            )
          )
            return;
        } else if (period === "year") {
          const dt = new Date(it.item_created_at);
          const refYear = selectedDate
            ? new Date(selectedDate).getFullYear()
            : new Date().getFullYear();
          if (dt.getFullYear() !== refYear) return;
          key = `month-${dt.getMonth()}`;
        } else {
          key = `y-${new Date(it.item_created_at).getFullYear()}`;
        }
        if (keys.has(key)) revenue += (it.item_price || 0) * (it.quantity || 1);
      });
    }
    return { total, revenue };
  }, [selectedDate, dayItems, chartData, servedItems, period]);

  /* -------------------------
     Render
     ------------------------- */

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardHeader
        title="Performance Summary"
        avatar={<TimerTwoToneIcon />}
        sx={{
          "& .MuiCardHeader-title": { fontWeight: 700, fontSize: "1.05rem" },
        }}
        // subheader={
        //   selectedDate
        //     ? `Showing details for ${selectedDate}`
        //     : `Period: ${period.toUpperCase()}`
        // }
      />
      <Divider />
      <CardContent>
        {chartData.length > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2, alignItems: "center", justifyContent: "flex-end" }}
          >
            <TextField
              type="date"
              label="Pick date (show day details)"
              InputLabelProps={{ shrink: true }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ minWidth: 170 }}
            />

            <TextField
              select
              label="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              sx={{ minWidth: 140 }}
              // helperText="Chart aggregation"
            >
              <MenuItem value="week">Week (days)</MenuItem>
              <MenuItem value="month">Month (weeks)</MenuItem>
              <MenuItem value="year">Year (months)</MenuItem>
              <MenuItem value="all">All (years)</MenuItem>
            </TextField>

            <Button
              onClick={() => {
                setSelectedDate("");
                setPeriod("week");
              }}
            >
              Reset
            </Button>

            {/* <Box sx={{ ml: "auto", textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              Total served
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {summary.total || 0} items
              {summary.revenue
                ? ` • $${Number(summary.revenue).toFixed(2)}`
                : ""}
            </Typography>
          </Box> */}
          </Stack>
        )}

        {/* If the user picked a date → show a detailed table for that date */}
        {selectedDate ? (
          <>
            {dayItems.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                <Typography variant="h6">
                  No items served on {selectedDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try another date or remove the date filter.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ height: 420, width: "100%" }}>
                <DataGrid
                  rows={dayItems.map((it) => ({
                    id: it.order_item_id,
                    time: new Date(it.item_created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    item: it.menu_item_name,
                    qty: it.quantity || 1,
                    price: (it.item_price || 0).toFixed(2),
                    total: ((it.item_price || 0) * (it.quantity || 1)).toFixed(
                      2
                    ),
                    table: it.table_number ?? "—",
                    waiter: `${it.waiter_first_name || ""} ${
                      it.waiter_last_name || ""
                    }`.trim(),
                    preparer: `${it.preparer_first_name || ""} ${
                      it.preparer_last_name || ""
                    }`.trim(),
                  }))}
                  columns={[
                    { field: "time", headerName: "Time", width: 100 },
                    { field: "item", headerName: "Item", width: 240 },
                    { field: "qty", headerName: "Qty", width: 80 },
                    { field: "price", headerName: "Price ($)", width: 110 },
                    { field: "total", headerName: "Total ($)", width: 120 },
                    { field: "table", headerName: "Table", width: 90 },
                    { field: "waiter", headerName: "Waiter", width: 150 },
                    {
                      field: "preparer",
                      headerName: "Prepared by",
                      width: 150,
                    },
                  ]}
                  pageSize={8}
                  rowsPerPageOptions={[8, 16, 32]}
                  disableSelectionOnClick
                />
              </Box>
            )}
          </>
        ) : (
          /* Chart mode */
          <>
            {chartData.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                <InfoOutlinedIcon sx={{ mb: 1 }} fontSize="large" />
                <Typography variant="body1" fontWeight={600}>
                  No items to display
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                  Try changing period or date range.
                </Typography> */}
              </Box>
            ) : (
              <Box sx={{ width: "100%", height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="served"
                      fill="#2e7d32"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
