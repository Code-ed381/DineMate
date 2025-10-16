import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Divider,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  FilterAlt,
  MoreHoriz,
  AttachMoney,
  CreditCard,
  Smartphone,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

export default function TransactionHistory({ allSessions }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // columns for DataGrid
  const columns = [
    {
      field: "order_id",
      headerName: "Order ID",
      flex: 1,
      renderCell: (params) => `ORD-${params.value}`,
    },
    { field: "table_number", headerName: "Table Number", flex: 1 },
    {
      field: "opened_at",
      headerName: "Date",
      flex: 1.5,
      renderCell: (params) =>
        new Date(params.value).toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      field: "waiter",
      headerName: "Waiter",
      flex: 1.5,
      renderCell: (params) =>
        `${params.row?.waiter_first_name ?? ""} ${
          params.row?.waiter_last_name ?? ""
        }`,
    },
    {
      field: "order_total",
      headerName: "Amount",
      type: "number",
      flex: 1,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => `$${Number(params.value || 0).toFixed(2)}`,
    },
    {
      field: "payment_method",
      headerName: "Method",
      flex: 1,
      renderCell: (params) => {
        switch (params.value) {
          case "cash":
            return <Chip icon={<AttachMoney />} label="Cash" size="small" />;
          case "card":
            return <Chip icon={<CreditCard />} label="Card" size="small" />;
          case "momo":
            return <Chip icon={<Smartphone />} label="MoMo" size="small" />;
          default:
            return <Chip label="Not Paid" size="small" color="error" />;
        }
      },
    },
    {
      field: "session_status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === "open"
              ? "success"
              : params.value === "billed"
              ? "warning"
              : "error"
          }
        />
      ),
    },
  ];


  // filtered + searched rows
  const rows = useMemo(() => {
    return allSessions
      .filter((session) => {
        const matchesSearch =
          `${session.waiter_first_name} ${session.waiter_last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          String(session.table_number).includes(searchQuery) ||
          String(session.order_id).includes(searchQuery);

        const matchesPayment =
          paymentFilter === "all" || session.payment_method === paymentFilter;

        const matchesStatus =
          statusFilter === "all" || session.session_status === statusFilter;

        return matchesSearch && matchesPayment && matchesStatus;
      })
      .map((s, i) => ({ id: s.session_id || i, ...s })); // datagrid requires unique id
  }, [allSessions, searchQuery, paymentFilter, statusFilter]);

  return (
    <Card sx={{ borderRadius: 2, height: "calc(100vh - 240px)", overflow: "auto" }}>
      <CardContent
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          {/* <FilterAlt color="primary" /> */}
          <Typography variant="subtitle1">Transaction History</Typography>
          <Box sx={{ flex: 1 }} />
        </Stack>

        {/* Search + Filters */}
        {/* <Stack direction="row" spacing={2} mb={2}>
          <TextField
            size="small"
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />

          <TextField
            size="small"
            select
            label="Payment"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="momo">MoMo</MenuItem>
            <MenuItem value={null}>Not Paid</MenuItem>
          </TextField>

          <TextField
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="billed">Billed</MenuItem>
            <MenuItem value="close">Closed</MenuItem>
          </TextField>
        </Stack> */}

        <Divider sx={{ mb: 2 }} />

        {/* DataGrid */}
        <Box sx={{ flex: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            autoHeight={false}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
