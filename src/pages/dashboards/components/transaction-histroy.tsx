import React, { useMemo } from "react";
import { Box, Card, CardContent, Stack, Typography, Divider, Chip } from "@mui/material";
import { AttachMoney, CreditCard, Smartphone } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface TransactionHistoryProps {
  allSessions: any[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ allSessions }) => {
  const columns: GridColDef[] = [
    { field: "order_id", headerName: "Order ID", flex: 1, renderCell: (params) => `ORD-${params.value?.toString().slice(0, 8)}` },
    { field: "table_number", headerName: "Table", flex: 1 },
    { field: "opened_at", headerName: "Date", flex: 1.5, renderCell: (params) => new Date(params.value).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) },
    { field: "waiter", headerName: "Waiter", flex: 1.5, renderCell: (params) => `${params.row?.waiter_first_name ?? ""} ${params.row?.waiter_last_name ?? ""}`.trim() || "System" },
    { field: "order_total", headerName: "Amount", type: "number", flex: 1, align: "right", headerAlign: "right", renderCell: (params) => `£${Number(params.value || 0).toFixed(2)}` },
    { field: "discount", headerName: "Disc.", type: "number", flex: 0.8, align: "right", headerAlign: "right", renderCell: (params) => params.value > 0 ? `${params.value}%` : "-" },
    {
      field: "payment_method", headerName: "Method", flex: 1, renderCell: (params) => {
        switch (params.value) {
          case "cash": return <Chip icon={<AttachMoney />} label="Cash" size="small" />;
          case "card": return <Chip icon={<CreditCard />} label="Card" size="small" />;
          case "momo": return <Chip icon={<Smartphone />} label="MoMo" size="small" />;
          case "online": return <Chip label="Online" size="small" color="primary" variant="outlined" />;
          case "card+cash": return <Chip label="Card+Cash" size="small" color="secondary" variant="outlined" />;
          default: return <Chip label="Not Paid" size="small" color="error" />;
        }
      }
    },
    { field: "session_status", headerName: "Status", flex: 1, renderCell: (params) => <Chip label={params.value} size="small" color={params.value === "open" ? "success" : params.value === "billed" ? "warning" : "error"} /> },
  ];

  const rows = useMemo(() => allSessions.map((s, i) => ({ id: s.session_id || i, ...s })), [allSessions]);

  return (
    <Card sx={{ borderRadius: 2, height: "calc(100vh - 240px)", overflow: "auto" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}><Typography variant="subtitle1">Transaction History</Typography></Stack>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ flex: 1 }}><DataGrid rows={rows} columns={columns} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} disableRowSelectionOnClick /></Box>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
