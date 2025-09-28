import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Paper,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import useBarStore from "../lib/barStore";
import BarTakeAwaySkeleton from "./skeletons/bar-takeaway-skeleton";

// Each tab = one customer cart
export default function OTCTabs() {
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
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category_id === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags &&
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    return matchesCategory && matchesSearch;
  });

  const activeCart = getActiveCart();
  const total = getTotal();

  // Example removeTab function
  const removeTab = (id) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
  };

  return (
    <>
      {loadingItems ? (
        <BarTakeAwaySkeleton />
      ) : (
        <Box sx={{ mt: 5 }}>
          <Grid container spacing={3}>
            {/* Menu Grid */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={9}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={
                        selectedCategory === "all" ? "contained" : "outlined"
                      }
                      color="primary"
                      size="small"
                      onClick={() => setSelectedCategory("all")}
                      sx={{ mb: 2 }}
                    >
                      All
                    </Button>
                    {categories?.map((category) => (
                      <Button
                        variant={
                          selectedCategory === category.id
                            ? "contained"
                            : "outlined"
                        }
                        color="primary"
                        size="small"
                        onClick={() => setSelectedCategory(category.id)}
                        sx={{ mb: 2 }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search drinks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                {filteredItems.map((drink) => (
                  <Grid item xs={12} sm={6} md={3} key={drink.id}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                      <CardActionArea onClick={() => addToCart(drink)}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={drink.image_url}
                          alt={drink.name}
                        />
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {drink.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${drink.price}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Customer Tabs */}
            <Grid item xs={12} md={2}>
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 2, borderRadius: 2 }}>
                  <Button
                    onClick={addNewTab}
                    fullWidth
                    variant="contained"
                    color="info"
                    sx={{ mb: 2 }}
                  >
                    + Add Tab
                  </Button>

                  {/* Tabs for multiple customers */}
                  {tabs.length > 0 && (
                    <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={activeTab}
                  onChange={(event, newValue) => setActiveTab(newValue)}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ mb: 2 }}
                >
                  {tabs.map((tab, index) => (
                    <Tab
                      key={tab.id}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          {tab.name}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation(); // prevents activating the tab on delete
                              removeTab(tab.id);
                            }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      value={index}
                      sx={{ alignItems: "flex-start" }}
                    />
                  ))}
                    </Tabs>
                  )}
                  
                  {tabs.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No tabs available
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Receipt Table */}
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Receipt
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeCart.length > 0 ? (
                      activeCart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">${item.price}</TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">
                            ${item.price * item.qty}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              color="error"
                              size="small"
                              onClick={() => removeFromCart(item.id)}
                            >
                              X
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No items in receipt
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Total row */}
                    {activeCart.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="right"
                          sx={{ fontWeight: "bold" }}
                        >
                          Total
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          ${total}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setTabs((prev) =>
                        prev.map((tab, idx) =>
                          idx === activeTab ? { ...tab, cart: [] } : tab
                        )
                      )
                    }
                    disabled={activeCart.length === 0}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={activeCart.length === 0}
                  >
                    Submit Order
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
}
