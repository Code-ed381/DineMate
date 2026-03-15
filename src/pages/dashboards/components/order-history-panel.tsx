import React from "react";
import { Card, CardHeader, CardContent, Chip, Box, Divider, Avatar, Stack, Typography, Paper, useTheme, useMediaQuery, alpha, Grid } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import useKitchenStore from "../../../lib/kitchenStore";

const OrderHistoryTable = () => {
  const { orderItems }: any = useKitchenStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(dateString));
  };

  const columns: GridColDef[] = [
    { field: "order_id", headerName: "Order No.", width: 90 },
    { field: "table_number", headerName: "Box", width: 70 },
    { field: "course", headerName: "Course", width: 80, renderCell: (p) => <Chip label={`C${p.value}`} size="small" variant="outlined" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} /> },
    { 
      field: "waiter", 
      headerName: "Waiter", 
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={params.row.waiter_avatar} sx={{ width: 22, height: 22 }} />
          <Typography variant="caption" fontWeight={600}>{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: "preparer", 
      headerName: "Preparer", 
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={params.row.preparer_avatar} sx={{ width: 22, height: 22, bgcolor: alpha(theme.palette.secondary.main, 0.2), color: 'secondary.main', fontSize: '10px' }}>
            {params.value ? params.value[0] : ""}
          </Avatar>
          <Typography variant="caption" fontWeight={600}>{params.value || "Not assigned"}</Typography>
        </Box>
      )
    },
    { field: "item", headerName: "Item", width: 180, renderCell: (p) => <Typography variant="caption" fontWeight={700}>{p.value}</Typography> },
    { field: "quantity", headerName: "Qty", width: 60 },
    { field: "duration", headerName: "Duration", width: 80, renderCell: (p) => p.value !== null ? <Chip label={`${p.value}m`} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }} /> : "—" },
    { field: "total_price", headerName: "Price", width: 90, renderCell: (p) => <Typography variant="caption" fontWeight={800}>₦{Number(p.value).toLocaleString()}</Typography> },
    { field: "status", headerName: "Status", width: 100, renderCell: (p) => <Chip label={p.value?.toLowerCase()} color={p.value === "served" ? "success" : p.value === "ready" ? "primary" : "warning"} size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} /> },
    { field: "order_date", headerName: "Ordered At", width: 160 },
  ];

  const rows = React.useMemo(() => {
    return orderItems?.map((dish: any) => {
      const waiterFullName = `${dish?.waiter_first_name || ""} ${dish?.waiter_last_name || ""}`.trim() || "Unknown Waiter";
      const preparerFullName = `${dish?.preparer_first_name || ""} ${dish?.preparer_last_name || ""}`.trim();

      return {
        id: dish.kitchen_task_id || dish.order_item_id,
        order_id: dish.order_id,
        table_number: dish?.table_number ?? "—",
        course: dish?.course || 1,
        waiter: waiterFullName,
        waiter_avatar: dish?.waiter_avatar,
        preparer: preparerFullName,
        preparer_avatar: dish?.preparer_avatar,
        item: dish?.menu_item_name,
        quantity: dish?.quantity,
        duration: dish?.preparation_duration,
        total_price: dish?.total_price || 0,
        status: dish?.order_item_status,
        order_date: formatDate(dish?.task_created_at),
        served_date: formatDate(dish?.task_completed_at || dish?.completed_at || dish?.task_updated_at || dish?.updated_at),
      };
    }) || [];
  }, [orderItems]);

  return (
    <Card sx={{ borderRadius: 3, height: { xs: 550, md: 600 }, display: "flex", flexDirection: "column", width: "100%", boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <CardHeader 
        avatar={<ReceiptLongTwoToneIcon sx={{ fontSize: { xs: 20, md: 24 } }} />} 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Order History</Typography>
            <Chip label={rows.length} size="small" sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
          </Box>
        } 
        sx={{ p: { xs: 1.5, md: 2 } }}
      />
      <Divider />
      <CardContent sx={{ flex: 1, p: 0, overflow: "auto", bgcolor: isMobile ? alpha(theme.palette.background.default, 0.5) : 'transparent' }}>
        {isMobile ? (
          <Stack spacing={1} sx={{ p: 1 }}>
            {rows.map((row: any) => (
              <Paper 
                key={row.id} 
                variant="outlined" 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                       <Typography fontWeight={800} variant="body2" noWrap>{row.item}</Typography>
                       <Chip label={`C${row.course}`} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                      #{String(row.order_id).slice(0, 5)} • Table {row.table_number} • ₦{Number(row.total_price).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip 
                    label={row.status?.toLowerCase()} 
                    color={row.status === "served" ? "success" : row.status === "ready" ? "primary" : "warning"} 
                    size="small" 
                    sx={{ fontWeight: 700, height: 18, fontSize: '0.6rem' }}
                  />
                </Stack>

                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Waiter</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Avatar src={row.waiter_avatar} sx={{ width: 14, height: 14 }} />
                      <Typography variant="caption" fontWeight={700} noWrap sx={{ fontSize: '0.7rem' }}>{row.waiter}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>Preparer</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Avatar src={row.preparer_avatar} sx={{ width: 14, height: 14 }} />
                      <Typography variant="caption" fontWeight={700} noWrap sx={{ fontSize: '0.7rem' }}>{row.preparer || "Pending"}</Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
                    {row.order_date}
                  </Typography>
                  {row.duration && (
                    <Chip 
                      label={`Took ${row.duration}m`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }} 
                    />
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid 
              rows={rows} 
              columns={columns} 
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} 
              disableRowSelectionOnClick 
              sx={{ 
                border: 'none',
                '& .MuiDataGrid-cell': {
                  fontSize: '0.75rem'
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistoryTable;
