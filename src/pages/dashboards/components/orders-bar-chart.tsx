import React, { useMemo, useState } from "react";
import {
  Card, CardHeader, CardContent, TextField, Stack, Button, Divider, MenuItem, Typography, Box, Paper
} from "@mui/material";
import TimerTwoToneIcon from "@mui/icons-material/TimerTwoTone";
import EmptyState from "../../../components/empty-state";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import useKitchenStore from "../../../lib/kitchenStore";

const toISODateLocal = (dateInput: any) => {
  const d = new Date(dateInput);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().split("T")[0];
};

const weekdayName = (date: any) => new Date(date).toLocaleDateString(undefined, { weekday: "short" });
const monthNameMonthIndex = (idx: number) => new Date(2020, idx, 1).toLocaleString(undefined, { month: "short" });

const startOfWeek = (date: any) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  return s;
};

const weekIndexInMonth = (date: any) => {
  const d = new Date(date);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstDayWeekday = (first.getDay() + 6) % 7;
  const dayOfMonth = d.getDate();
  return Math.ceil((firstDayWeekday + dayOfMonth) / 7);
};

export default function OrdersServedPerformance() {
  const { orderItems = [] }: any = useKitchenStore();
  const [selectedDate, setSelectedDate] = useState("");
  const [period, setPeriod] = useState<string>("week");

  const servedItems = useMemo(() => (orderItems || []).filter((it: any) => (it?.order_item_status || "").toLowerCase() === "served"), [orderItems]);

  const chartData = useMemo(() => {
    if (!servedItems.length) return [];
    const now = new Date();
    const ref = selectedDate ? new Date(selectedDate) : now;

    if (period === "week") {
      const start = startOfWeek(ref);
      const buckets: Record<string, any> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = toISODateLocal(d);
        buckets[key] = { label: weekdayName(d), key, served: 0 };
      }
      servedItems.forEach((it: any) => {
        const k = toISODateLocal(it.task_created_at);
        if (k in buckets) buckets[k].served += it.quantity || 1;
      });
      return Object.values(buckets);
    }

    if (period === "month") {
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const days = new Date(year, month + 1, 0).getDate();
      const buckets: Record<string, any> = {};
      for (let d = 1; d <= days; d++) {
        const dateObj = new Date(year, month, d);
        const wk = weekIndexInMonth(dateObj);
        const key = `week-${wk}`;
        if (!buckets[key]) buckets[key] = { label: `Week ${wk}`, key, served: 0 };
      }
      servedItems.forEach((it: any) => {
        const dt = new Date(it.task_created_at);
        if (dt.getFullYear() === year && dt.getMonth() === month) {
          const wk = weekIndexInMonth(dt);
          buckets[`week-${wk}`].served += it.quantity || 1;
        }
      });
      return Object.keys(buckets).sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1])).map(k => buckets[k]);
    }

    if (period === "year") {
      const year = ref.getFullYear();
      const buckets: Record<string, any> = {};
      for (let m = 0; m < 12; m++) {
        buckets[`month-${m}`] = { label: monthNameMonthIndex(m), key: `month-${m}`, served: 0 };
      }
      servedItems.forEach((it: any) => {
        const dt = new Date(it.task_created_at);
        if (dt.getFullYear() === year) buckets[`month-${dt.getMonth()}`].served += it.quantity || 1;
      });
      return Object.values(buckets);
    }

    const buckets: Record<string, any> = {};
    servedItems.forEach((it: any) => {
      const y = new Date(it.task_created_at).getFullYear();
      const key = `y-${y}`;
      if (!buckets[key]) buckets[key] = { label: `${y}`, key, served: 0 };
      buckets[key].served += it.quantity || 1;
    });
    return Object.keys(buckets).sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1])).map(k => buckets[k]);
  }, [servedItems, period, selectedDate]);

  const dayItems = useMemo(() => selectedDate ? servedItems.filter((it: any) => toISODateLocal(it.task_created_at) === selectedDate) : [], [servedItems, selectedDate]);

  const columns: GridColDef[] = [
    { field: "time", headerName: "Time", width: 100 },
    { field: "item", headerName: "Item", width: 240 },
    { field: "qty", headerName: "Qty", width: 80 },
    { field: "price", headerName: "Price ($)", width: 110 },
    { field: "total", headerName: "Total ($)", width: 120 },
    { field: "table", headerName: "Table", width: 90 },
    { field: "waiter", headerName: "Waiter", width: 150 },
    { field: "preparer", headerName: "Prepared by", width: 150 },
  ];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <CardHeader 
        title="Performance Summary" 
        avatar={<TimerTwoToneIcon />} 
        sx={{ 
          "& .MuiCardHeader-title": { fontWeight: 800, fontSize: { xs: "1rem", md: "1.1rem" } },
          pb: 1
        }} 
      />
      <Divider />
      <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={{ xs: 1.5, sm: 2 }} 
          sx={{ mb: { xs: 2.5, md: 3 }, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "flex-end" }}
        >
          <TextField 
            type="date" 
            label="Pick date" 
            InputLabelProps={{ shrink: true }} 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            sx={{ flex: { xs: 1, sm: '0 1 170px' } }} 
            size="small" 
          />
          <TextField 
            select 
            label="Period" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)} 
            sx={{ flex: { xs: 1, sm: '0 1 150px' } }} 
            size="small"
          >
            <MenuItem value="week">Week (days)</MenuItem>
            <MenuItem value="month">Month (weeks)</MenuItem>
            <MenuItem value="year">Year (months)</MenuItem>
            <MenuItem value="all">All (years)</MenuItem>
          </TextField>
          <Button 
            variant="outlined"
            onClick={() => { setSelectedDate(""); setPeriod("week"); }}
            sx={{ flex: { xs: 1, sm: 'auto' }, fontWeight: 700 }}
          >
            Reset
          </Button>
        </Stack>
        {selectedDate ? (
          dayItems.length === 0 ? (
            <EmptyState 
              title="No Items Served" 
              description={`No items served on ${selectedDate}`} 
              emoji="🍽️"
              height={300}
            />
          ) : (
            <Box sx={{ width: "100%", height: { xs: 250, md: 340 } }}>
              <DataGrid rows={dayItems.map((it: any) => ({ id: it.order_item_id, time: new Date(it.item_created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), item: it.menu_item_name, qty: it.quantity || 1, price: (it.item_price || 0).toFixed(2), total: ((it.item_price || 0) * (it.quantity || 1)).toFixed(2), table: it.table_number ?? "—", waiter: `${it.waiter_first_name || ""} ${it.waiter_last_name || ""}`.trim(), preparer: `${it.preparer_first_name || ""} ${it.preparer_last_name || ""}`.trim() }))} columns={columns} initialState={{ pagination: { paginationModel: { pageSize: 8 } } }} disableRowSelectionOnClick />
            </Box>
          )
        ) : (
          <Box sx={{ width: "100%", height: { xs: 250, md: 340 } }}>
            {chartData.length === 0 ? (
              <EmptyState 
                title="No Data" 
                description="No items to display for the selected period." 
                emoji="📉"
                height={300}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="served" fill="#2e7d32" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
