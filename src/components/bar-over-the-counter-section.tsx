import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  Paper,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Close,
  Search,
  Add,
  Remove,
  ShoppingCart,
  Receipt as ReceiptIcon,
  LocalBar,
} from "@mui/icons-material";
import useBarStore from "../lib/barStore";
import BarTakeAwaySkeleton from "./skeletons/bar-takeaway-skeleton";

const OTCTabs: React.FC = () => {
  const {
    tabs,
    setTabs,
    addNewTab,
    items,
    addToCart,
    removeFromCart,
    handleFetchItems,
    categories,
    setSelectedCategory,
    selectedCategory,
    setSearchQuery,
    searchQuery,
    getActiveCart,
    getTotal,
    setActiveTab,
    activeTab,
    loadingItems,
  } = useBarStore();

  useEffect(() => {
    handleFetchItems();
  }, [handleFetchItems]);

  const filteredItems = items.filter((item: any) => {
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCart = getActiveCart();
  const total = getTotal();

  const removeTab = (id: string) => {
    const newTabs = tabs.filter((tab: any) => tab.id !== id);
    setTabs(newTabs);
    if (activeTab >= newTabs.length && newTabs.length > 0) setActiveTab(newTabs.length - 1);
  };

  const getCartItemCount = (tabIndex: number) => tabs[tabIndex]?.cart.reduce((sum: number, item: any) => sum + item.qty, 0) || 0;

  if (loadingItems) return <BarTakeAwaySkeleton />;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f5f7fa", mt: 4 }}>
      <Paper elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "white" }}>
        <Box sx={{ px: 3, py: 2 }}>
           <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><LocalBar sx={{ fontSize: 32, color: "primary.main" }} /><Typography variant="h5" fontWeight="600">Bar Orders</Typography></Box>
              <Button onClick={addNewTab} variant="contained" startIcon={<Add />}>New Order</Button>
           </Box>
           <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
              {tabs.map((tab: any, index: number) => (
                <Badge key={tab.id} badgeContent={getCartItemCount(index)} color="error">
                   <Chip label={tab.name} onClick={() => setActiveTab(index)} onDelete={() => removeTab(tab.id)} variant={activeTab === index ? "filled" : "outlined"} color={activeTab === index ? "primary" : "default"} />
                </Badge>
              ))}
           </Stack>
        </Box>
      </Paper>
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex" }}>
         <Grid container sx={{ height: "100%" }}>
            <Grid item xs={12} md={8} sx={{ height: "100%", overflow: "auto", p: 3 }}>
               <TextField fullWidth placeholder="Search drinks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
               <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip label="All" onClick={() => setSelectedCategory("all")} variant={selectedCategory === "all" ? "filled" : "outlined"} />
                  {categories.map((c: any) => <Chip key={c.id} label={c.name} onClick={() => setSelectedCategory(c.id)} variant={selectedCategory === c.id ? "filled" : "outlined"} />)}
               </Stack>
               <Grid container spacing={2}>
                  {filteredItems.map((item: any) => (
                    <Grid item xs={6} sm={4} md={3} key={item.id}>
                       <Card><CardActionArea onClick={() => addToCart(item)}><CardMedia component="img" height="140" image={item.image_url} /><CardContent><Typography variant="subtitle2" noWrap>{item.name}</Typography><Typography variant="h6" color="primary">${item.price}</Typography></CardContent></CardActionArea></Card>
                    </Grid>
                  ))}
               </Grid>
            </Grid>
            <Grid item xs={12} md={4} sx={{ height: "100%", bgcolor: "white", p: 3, display: "flex", flexDirection: "column" }}>
               <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}><ReceiptIcon /> Summary</Typography>
               <Box sx={{ flex: 1, overflow: "auto" }}>
                  {activeCart.map((item: any) => (
                    <Card key={item.id} sx={{ mb: 1, p: 1 }}><Box display="flex" justifyContent="space-between" alignItems="center"><Typography variant="subtitle2">{item.name}</Typography><IconButton size="small" onClick={() => removeFromCart(item.id)}><Close fontSize="small" /></IconButton></Box><Box display="flex" justifyContent="space-between"><Typography>x{item.qty}</Typography><Typography fontWeight="bold">${(item.price * item.qty).toFixed(2)}</Typography></Box></Card>
                  ))}
               </Box>
               <Divider sx={{ my: 2 }} /><Box display="flex" justifyContent="space-between"><Typography variant="h6">Total</Typography><Typography variant="h5" color="primary" fontWeight="bold">${total.toFixed(2)}</Typography></Box>
               <Button variant="contained" fullWidth sx={{ mt: 2 }} size="large">Submit</Button>
            </Grid>
         </Grid>
      </Box>
    </Box>
  );
};

export default OTCTabs;
