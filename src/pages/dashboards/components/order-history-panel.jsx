import React from "react";
import { Card, CardHeader, CardContent, Chip, Box, Divider } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import useKitchenStore from "../../../lib/kitchenStore";

const OrderHistoryTable = () => {
  const { orderItems } = useKitchenStore();

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short", // Wed
      day: "2-digit", // 24
      month: "short", // Sept
      year: "2-digit", // 25
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  const rows = orderItems.map((dish) => ({
    id: dish.order_item_id, // DataGrid requires a unique id
    order_id: dish.order_id,
    table_number: dish?.table_number ?? "—",
    waiter: `${dish?.waiter_first_name} ${dish?.waiter_last_name}`,
    item: dish?.menu_item_name,
    price: dish?.menu_item_price,
    quantity: dish?.quantity,
    total: dish?.order_total,
    status: dish?.item_status,
    order_date: formatDate(dish?.item_created_at),
    served_date: formatDate(dish?.item_updated_at),
  }));

  const columns = [
    { field: "order_id", headerName: "Order Number", width: 60 },
    { field: "table_number", headerName: "Table Number", width: 60 },
    { field: "waiter", headerName: "Waiter", width: 120 },
    { field: "item", headerName: "Item", width: 160 },
    { field: "quantity", headerName: "Qty", width: 60 },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => {
        const status = params?.value?.toLowerCase();
        return (
          <Chip
            label={status}
            color={
              status === "served"
                ? "success"
                : status === "preparing"
                ? "warning"
                : status === "pending"
                ? "warning"
                : status === "ready"
                ? "primary"
                : "default"
            }
            size="small"
          />
        );
      },
    },
    {
      field: "order_date",
      headerName: "Order Date",
      width: 180,
    },
    {
      field: "served_date",
      headerName: "Served Date",
      width: 180
    },
  ];


  return (
    <Card
      sx={{
        borderRadius: 2,
        height: 500,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        avatar={<ReceiptLongTwoToneIcon />}
        title={
          <>
            Completed Orders History{" "}
            <Chip label={rows.length || 0} size="small" />
          </>
        }
        sx={{
          "& .MuiCardHeader-title": {
            fontWeight: 700,
            fontSize: "1.1rem",
          },
        }}
      />
      <Divider />
      <CardContent sx={{ flex: 1, p: 0, overflow: "auto" }}>
        <Box sx={{ overflow: "auto" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "action.hover",
                fontWeight: 600,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderHistoryTable;
