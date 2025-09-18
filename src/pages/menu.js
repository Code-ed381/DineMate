import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableContainer,
  Paper,
  CardMedia,
  CardActions,
  CardHeader,
  Table,
  TableHead,
  Grid,
  Skeleton,
  TableRow, TableCell, TableBody, TableFooter, Alert, AlertTitle, OutlinedInput, InputLabel, FormControl, ToggleButton, ToggleButtonGroup, TextField, Stepper, Step, StepLabel, Typography, Stack, Box, InputAdornment, IconButton, Card, CardContent, CardActionArea, Button, CircularProgress, LinearProgress
} from '@mui/material';
import { Search as SearchIcon, Cancel as CancelIcon } from '@mui/icons-material';
import useMenuStore from  "../lib/menuStore";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
import { printBillOnly, printForKitchen } from "../components/PrintWindow";
import { format } from 'date-fns';
import useAuthStore from "../lib/authStore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { formatDistanceStrict } from "date-fns";


const Menu = () => {
  const navigate = useNavigate();
  const {
    assignedTables,
    chosenTable,
    setChosenTable,
    isSelectedTable,
    assignedTablesLoaded,
    tableSelected,
    orders,
    orderTime,
    searchMeals,
    totalOrdersPrice,
    totalOrdersQty,
    orderItems,
    orderItemsLoaded,
    orderId,
    waiterName,
    activeStep,
    steps,
    handleNext,
    handleBack,
    proceedToCheckOut,
    formatCashInput,
    setCash,
    cash,
    card,
    setCard,
    addOrUpdateObject,
    handleRemoveItem,
    noTablesFound,
    bill_printed,
    searchMealValue,
    getActiveSessionByRestaurant,
    setSelectedCategory,
    selectedCategory,
    filterMenuItemsByCategory,
    menuItems,
    menuItemsLoaded,
    loadingMenuItems,
    categories,
    fetchCategories,
    loadingCategories,
    filteredMenuItems,
    fetchMenuItems,
    isSelectedCategory,
    setFilteredMenuItems,
    chosenTableSession,
    chosenTableOrderItems,
  } = useMenuStore();

  const { user } = useAuthStore();

  useEffect(() => {
    const controller = new AbortController();
    getActiveSessionByRestaurant();
    fetchCategories();
    fetchMenuItems();
    console.log(user)
    return () => {
      controller.abort();
    };
  }, [getActiveSessionByRestaurant, fetchCategories, fetchMenuItems]); // Functions included in the dependency array

  const [activeTab, setActiveTab] = useState('meals'); // State to track active tab

  const handleTabChange = (event, newTab) => {
    if (newTab !== null) {
        setActiveTab(newTab);
    }
  };

  // Format date and time
  function formatDateTime(isoString) {
    if (!isoString) return "N/A";

    const date = new Date(isoString);
    if (isNaN(date)) return "Invalid date";

    return formatDistanceStrict(date, new Date(), { addSuffix: true });
  }

  // Define the content for each step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Stack
              direction="row"
              spacing={2}
              mt={2}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="title">
                ORDER NO. {chosenTableSession?.order_id}
              </Typography>
              {/* <Typography variant="title">{user?.user?.user_metadata?.firstName}</Typography> */}
              <Typography variant="body1">
                {formatDateTime(chosenTableSession?.opened_at)}
              </Typography>
            </Stack>
            <TableContainer
              component={Paper}
              sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                  </TableRow>
                </TableHead>

                {assignedTablesLoaded ? (
                  <>
                    {chosenTableOrderItems?.length > 0 ? (
                      <TableBody>
                        {chosenTableOrderItems?.map((item, index) => {
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                {chosenTableSession?.session_status ===
                                  "open" && (
                                  <IconButton
                                    onClick={() => handleRemoveItem(item)}
                                    color="error"
                                    size="small"
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.menu_item?.name?.toUpperCase()}
                              </TableCell>
                              <TableCell>{item.price?.toFixed(2)}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>
                                {(item.price * item.quantity)?.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    ) : (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              No items in order
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <LinearProgress sx={{ width: "100%" }} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">Order Total</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">
                        {chosenTableSession?.order_total?.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">Tax</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">
                        {chosenTableSession?.order_total?.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">Discount</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">
                        {chosenTableSession?.order_total?.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {chosenTableSession?.order_total?.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </>
        );
      case 1:
        return (
          <>
            <Stack justifyContent='center' alignItems='center' spacing={3} mt={4}>
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant='h2'><strong>&#163; {formatCashInput(totalOrdersPrice)}</strong></Typography>

              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount">Card</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  startAdornment={<InputAdornment position="start">{<CreditScoreIcon/>}</InputAdornment>}
                  label="Amount"
                  value={card}
                  onChange={(e) => {
                    setCard(e.target.value);
                  }}
                />
              </FormControl>

              
              <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount">Cash</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  startAdornment={<InputAdornment position="start">{<CurrencyPoundIcon/>}</InputAdornment>}
                  label="Amount"
                  value={cash}
                  onChange={(e) => {
                    setCash(e.target.value);
                  }}
                />
              </FormControl>
            </Stack>
          </>
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const handleCategoryClick = async (category) => {
    await setSelectedCategory(category);

    if (category.name === selectedCategory) {
      setFilteredMenuItems(menuItems);

      setSelectedCategory('');
    } else {
      filterMenuItemsByCategory(category);
    }
  };
  
  return (
    <Box m={2}>
      {/* {assignedTables.length >  0 ? (
        <Box sx={{ textAlign: "center", mt: 20 }}>
          <TableRestaurantIcon
            sx={{ fontSize: 150, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tables assigned to you
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Go to tables section to book tables
          </Typography>
          <Button
            variant="contained"
            color="info"
            onClick={() => navigate("/app/tables")}
          >
            Book Tables
          </Button>
        </Box>
      ) : (
      )} */}
      <div className="row">
        <div className="col-8">
          <Card>
            {assignedTables.length >= 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                mb={1}
                sx={{ padding: 2 }}
              >
                <>
                  {assignedTablesLoaded === false ? (
                    <>
                      <Skeleton
                        variant="rectangular"
                        width={125}
                        height={65}
                        sx={{ borderRadius: 2 }}
                      />
                    </>
                  ) : (
                    <>
                      {assignedTables.map((table, i) => (
                        <Button
                          variant={
                            isSelectedTable(table) ? "contained" : "outlined"
                          }
                          key={i}
                          sx={{ padding: 4, marginRight: 1 }}
                          onClick={() => setChosenTable(table)} // Update selected table
                        >
                          Table {table.table_number}
                        </Button>
                      ))}
                    </>
                  )}
                </>
              </Box>
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                mb={1}
                sx={{ padding: 2 }}
              >
                <Alert severity="info" variant="basic">
                  No tables assigned to you
                </Alert>
              </Box>
            )}
          </Card>

          {assignedTables.length === 0 && (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <TableRestaurantIcon
                sx={{ fontSize: 100, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tables assigned to you
              </Typography>
              <Button
                variant="contained"
                color="info"
                sx={{ mt: 2 }}
                size="large"
                onClick={() => navigate("/app/tables")}
              >
                Book Tables
              </Button>
            </Box>
          )}

          {tableSelected === true && menuItems.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 4,
              }}
            >
              {/* Top Row: Search */}
              <TextField
                onChange={(e) => searchMeals(e.target.value)}
                value={searchMealValue}
                fullWidth
                size="small"
                label="Search for menu items... e.g. pasta"
                id="search-field-meals"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Categories Row: Scrollable */}
              {categories?.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    overflowX: "auto",
                    gap: 1,
                    pb: 1, // little padding for smooth scroll
                    "&::-webkit-scrollbar": {
                      display: "none", // hide scrollbar
                    },
                  }}
                >
                  {categories.map((category, i) => (
                    <Button
                      key={i}
                      variant={
                        category.name === selectedCategory
                          ? "contained"
                          : "outlined"
                      }
                      onClick={() => handleCategoryClick(category)}
                      sx={{
                        flexShrink: 0, // prevents button from shrinking in scroll
                      }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </Box>
              ) : (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ width: "100%", mb: 1 }}
                >
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ height: 50, width: 120, borderRadius: 4 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ height: 50, width: 120, borderRadius: 4 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ height: 50, width: 120, borderRadius: 4 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ height: 50, width: 120, borderRadius: 4 }}
                  />
                </Stack>
              )}
            </Box>
          )}

          {tableSelected === true && (
            <Box
              mt={2}
              sx={{
                width: "100%",
                flexGrow: 1,
                height: "calc(100vh - 150px)", // adjust 150px depending on your header/footer height
                overflowY: "auto",
                pr: 1, // optional: adds padding so scrollbar doesn't overlap content
              }}
            >
              {filteredMenuItems?.length === 0 ? (
                <Grid container>
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center", mt: 20 }}>
                      <MenuBookIcon
                        sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No menu items found
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        Contact your restaurant owner/admin to add menu items
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : loadingMenuItems === true ? (
                <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ flex: 1, height: 260, borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ flex: 1, height: 260, borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ flex: 1, height: 260, borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    // animation="wave"
                    sx={{ flex: 1, height: 260, borderRadius: 2 }}
                  />
                </Stack>
              ) : (
                <Grid container spacing={2}>
                  {filteredMenuItems?.map((item, i) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                      <Card sx={{ height: "100%" }}>
                        <CardActionArea onClick={() => addOrUpdateObject(item)}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={item.image_url}
                            alt={item.name}
                          />
                          <CardContent>
                            {/* Name + Price in one row */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                gutterBottom
                                variant="button"
                                component="div"
                                sx={{
                                  flex: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  pr: 2, // some padding so text doesn't touch price
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                variant="body1"
                                fontWeight={900}
                                sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                              >
                                $ {item.price}
                              </Typography>
                            </Box>

                            {/* Description below */}
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary", mt: 1 }}
                            >
                              {item.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </div>

        {!noTablesFound && (
          <div className="col-4">
            {tableSelected ? (
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header actions */}
                {/* {totalOrdersPrice === 0 && (
                  <CardHeader
                    title={
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          disabled={proceedToCheckOut === true}
                          sx={{ padding: 2 }}
                          size="large"
                          startIcon={<SoupKitchenIcon />}
                          onClick={() =>
                            printForKitchen(
                              orderId,
                              waiterName,
                              chosenTable,
                              orderItems
                            )
                          }
                        >
                          Print For Kitchen
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ padding: 2 }}
                          size="large"
                          disabled={proceedToCheckOut === true}
                          startIcon={<ReceiptLongIcon />}
                          onClick={() =>
                            printBillOnly(
                              orderId,
                              waiterName,
                              chosenTable,
                              totalOrdersQty,
                              totalOrdersPrice,
                              orderItems
                            )
                          }
                        >
                          Print Bill Only
                        </Button>
                      </Stack>
                    }
                  />
                )} */}

                {/* Body */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ width: "100%" }}>
                    <Stepper activeStep={activeStep}>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>

                    {activeStep === steps.length ? (
                      <Typography sx={{ mt: 2, mb: 1 }}>
                        All steps completed - you&apos;re finished
                      </Typography>
                    ) : (
                      <Box sx={{ mt: 2 }}>{getStepContent(activeStep)}</Box>
                    )}
                  </Box>
                </CardContent>

                {/* Footer */}
                {chosenTableOrderItems?.length > 0 && (
                  <CardActions sx={{ flexDirection: "column", gap: 1 }}>
                    {proceedToCheckOut ? (
                      <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ padding: 2 }}
                          size="large"
                          color="warning"
                          startIcon={<KeyboardBackspaceIcon />}
                          onClick={handleBack}
                        >
                          Back
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ padding: 2 }}
                          size="large"
                          color="success"
                          endIcon={<PriceCheckIcon />}
                          onClick={handleNext}
                        >
                          Confirm Payment
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ padding: 2 }}
                        size="large"
                        color="success"
                        disabled={!bill_printed}
                        endIcon={<ShoppingCartCheckoutIcon />}
                        onClick={handleNext}
                      >
                        Proceed To CheckOut
                      </Button>
                    )}
                  </CardActions>
                )}
              </Card>
            ) : (
              <Alert severity="info" sx={{ width: "100%" }}>
                <Typography variant="h6">
                  SELECT A TABLE TO OPEN RECEIPT
                </Typography>
              </Alert>
            )}
          </div>
        )}
      </div>
    </Box>
  );
}

export default Menu;