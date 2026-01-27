import React from "react";
import { Card, CardHeader, CardContent, Chip, Box, Divider, Avatar } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import useKitchenStore from "../../../lib/kitchenStore";

const OrderHistoryTable = () => {
  const { orderItems }: any = useKitchenStore();

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(dateString));
  };

  const columns: GridColDef[] = [
    { field: "order_id", headerName: "Order No.", width: 100 },
    { field: "table_number", headerName: "Table No.", width: 100 },
    { 
      field: "waiter", 
      headerName: "Waiter", 
      width: 200,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
               src={params.row.waiter_avatar} 
               alt={params.value}
               sx={{ width: 24, height: 24 }}
            />
            {params.value}
          </Box>
        );
      }
    },
    { field: "item", headerName: "Item", width: 200 },
    { field: "quantity", headerName: "Qty", width: 100 },
    { field: "status", headerName: "Status", width: 120, renderCell: (p) => <Chip label={p.value?.toLowerCase()} color={p.value === "served" ? "success" : p.value === "ready" ? "primary" : "warning"} size="small" /> },
    { field: "order_date", headerName: "Order Date", width: 250 },
    { field: "served_date", headerName: "Served Date", width: 250 },
  ];

  const rows = orderItems?.map((dish: any) => ({
    id: dish.kitchen_task_id || dish.order_item_id,
    order_id: dish.order_id,
    table_number: dish?.table_number ?? "—",
    waiter: `${dish?.waiter_first_name} ${dish?.waiter_last_name}`,
    item: dish?.menu_item_name,
    quantity: dish?.quantity,
    status: dish?.order_item_status,
    order_date: formatDate(dish?.task_created_at),
    served_date: formatDate(dish?.updated_at || dish?.task_created_at),
  })) || [];

  return (
    <Card sx={{ borderRadius: 2, height: { xs: 400, md: 500 }, display: "flex", flexDirection: "column", width: "100%" }}>
      <CardHeader avatar={<ReceiptLongTwoToneIcon />} title={<>Orders History <Chip label={rows.length} size="small" /></>} sx={{ "& .MuiCardHeader-title": { fontWeight: 700, fontSize: "1.1rem" } }} />
      <Divider />
      <CardContent sx={{ flex: 1, p: 0, overflow: "auto" }}>
        <Box sx={{ overflow: "auto" }}>
          <DataGrid rows={rows} columns={columns} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} disableRowSelectionOnClick />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderHistoryTable;
