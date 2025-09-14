import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Paper,
  CardMedia,
  CardActions,
  Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Alert, AlertTitle, OutlinedInput, InputLabel, FormControl, ToggleButton, ToggleButtonGroup, TextField, Stepper, Step, StepLabel, Typography, Stack, Box, InputAdornment, IconButton, Card, CardContent, CardActionArea, Button, CircularProgress, LinearProgress
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
import useMenuItemsStore from "../lib/menuItemsStore";


const Menu = () => {
  const {
    assignedTables,
    getAssigendTables,
    chosenTable,
    setChosenTable,
    isSelectedTable,
    assignedTablesLoaded,
    tableSelected,
    drinks,
    getDrinks,
    meals,
    orders,
    getMeals,
    mealsColor,
    mealsBackgroundColor,
    orderTime,
    filterMealsByCategory,
    filterDrinksByCategory,
    drinksColor,
    drinksBackgroundColor,
    searchMeals,
    searchDrinks,
    getOrders,
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
  } = useMenuStore();

  const {
    categories,
    fetchCategories,
    loadingCategories,
    menuItems,
    fetchMenuItems,
    loadingMenuItems,
  } = useMenuItemsStore();

  useEffect(() => {
    const controller = new AbortController();
    getActiveSessionByRestaurant();
    fetchCategories();
    fetchMenuItems();
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

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return format(date, "EEE dd MMM yy, hh:mm a").toUpperCase();;
  }

  // Define the content for each step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#fff' }}>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Qty</TableCell>
                    <TableCell sx={{ color: '#000', fontWeight: 'bold' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>

                {orderItemsLoaded ? (
                  <TableBody>
                    {orderItems?.map((item, index) => {
                      const isMenuItem = Boolean(item?.menuItems);
                      const productName = isMenuItem
                        ? `${item.menuItems.item_name?.toUpperCase()} ${item.menuItems.description?.toUpperCase()}`
                        : item?.drinks?.name?.toUpperCase();

                      const price = isMenuItem
                        ? item.menuItems.price
                        : item?.drinks?.price;

                      const amount = isMenuItem
                        ? item.menuItems.price * item.quantity
                        : item.total;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {!item?.orders?.printed && (
                              <IconButton onClick={() => handleRemoveItem(item)} color="error" size="small">
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell>{productName}</TableCell>
                          <TableCell>{price?.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{amount?.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <LinearProgress sx={{ width: '100%' }} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell colSpan={3}>
                      <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">{totalOrdersQty}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="bold">{totalOrdersPrice}</Typography>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            <Stack direction="row" spacing={4} mt={4} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="title">
                  ORDER NO. {orders[0]?.id}
                </Typography>
                <Typography variant="title">
                  {waiterName}
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(orderTime)}
                </Typography>
            </Stack>
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };
  
  return (
    <>
      {assignedTables.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          mb={1}
          sx={{ backgroundColor: "#fff", padding: 2, borderRadius: 2 }}
        >
          <Alert
            severity="info"
            variant="filled"
            fullWidth
            sx={{ width: "100%" }}
          >
            <AlertTitle>NO TABLES ASSIGNED TO YOU</AlertTitle>
            GO TO TABLE SECTION TO SELECT A TABLE
          </Alert>
        </Box>
      ) : (
        <div className="row">
            <div className="col-8">
              <Card>
                <Box
                  display="flex"
                  justifyContent="center"
                  mb={1}
                  sx={{ padding: 2 }}
                >
              <>
                {assignedTablesLoaded === false ? (
                  <>
                    <CircularProgress />
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
          </Card>

            {tableSelected === true && menuItems.length > 0 && (
              <TextField
                sx={{ borderColor: "#fff", mt: 2 }}
                onChange={(e) => searchMeals(e.target.value)}
                value={searchMealValue}
                fullWidth
                size="small"
                label="Type keyword to search for item..."
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
            )}


              {loadingMenuItems === true ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    borderRadius: 2,
                    mt: 2,
                    p: 2,
                  }}
                >
                  <LinearProgress />
                </Box>
              ) : (
                <>
                  {tableSelected === true ? (
                    <>
                      {categories?.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                            borderRadius: 2,
                            mt: 2,
                            p: 2,
                          }}
                        >
                          {categories.map((category, i) => (
                            <Button
                              variant="outlined"
                              key={i}
                              sx={{ padding: 2, marginRight: 1 }}
                              onClick={() => handleCategoryClick(category)}
                            >
                              {category.name}
                            </Button>
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        borderRadius: 2,
                        mt: 2,
                        p: 2,
                      }}
                    >
                      <Alert severity="info" variant="outlined" sx={{ width: "100%", textTransform: "uppercase" }}>Select a table to view menu items</Alert>
                    </Box>
                  )}
                </>
              )}

            {tableSelected === true && (
              <Box
                mt={2}
                sx={{ backgroundColor: "#fff", padding: 2, borderRadius: 2 }}
              >
                <div class="row" style={{ width: "100%" }}>
                  {menuItems?.length === 0 ? (
                    <div class="col-12">
                      <Alert
                        severity="info"
                        variant="filled"
                        sx={{ width: "100%" }}
                      >
                        <AlertTitle variant="button">
                          No Menu Item(s) Found
                        </AlertTitle>
                      </Alert>
                    </div>
                  ) : loadingMenuItems === true ? (
                    <CircularProgress />
                  ) : (
                    <>
                      {menuItems?.map((item, i) => (
                        <div class="col-3 mb-3" key={i}>
                          <Card sx={{ maxWidth: 345 }}>
                            <CardActionArea>
                              <CardMedia
                                component="img"
                                height="140"
                                image={item.image_url}
                                alt={item.name}
                              />
                              <CardContent>
                                <Typography
                                  gutterBottom
                                  variant="button"
                                  component="div"
                                >
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {item.description}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                            <CardActions sx={{ float: "right" }}>
                              <Typography
                                variant="body1"
                                fontWeight={900}
                                sx={{ pr: 2 }}
                              >
                                {item.price}
                              </Typography>
                            </CardActions>
                          </Card>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Box>
            )}
          </div>

          {!noTablesFound && (
            <div className="col-4">
              {tableSelected ? (
                <div class="card">
                  <div class="card-header">
                    {totalOrdersPrice > 0 && (
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
                    )}
                  </div>

                  <div class="card-body">
                    <Box sx={{ width: "100%" }}>
                      <Stepper activeStep={activeStep}>
                        {steps.map((label, index) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      {activeStep === steps.length ? (
                        <React.Fragment>
                          <Typography sx={{ mt: 2, mb: 1 }}>
                            All steps completed - you&apos;re finished
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              pt: 2,
                            }}
                          >
                            <Box sx={{ flex: "1 1 auto" }} />
                            {/* <Button onClick={handleReset}>Reset</Button> */}
                          </Box>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <Box sx={{ mt: 2 }}>{getStepContent(activeStep)}</Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              pt: 2,
                            }}
                          >
                            <Box sx={{ flex: "1 1 auto" }} />
                          </Box>
                        </React.Fragment>
                      )}
                    </Box>
                  </div>

                  <div class="card-footer text-body-secondary">
                    {totalOrdersPrice > 0 && (
                      <>
                        {proceedToCheckOut ? (
                          <Stack direction="row" spacing={1}>
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
                            disabled={bill_printed ? false : true}
                            endIcon={<ShoppingCartCheckoutIcon />}
                            onClick={handleNext}
                          >
                            Proceed To CheckOut
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  mb={1}
                  sx={{ backgroundColor: "#fff", padding: 2, borderRadius: 2 }}
                >
                  <Alert
                    severity="info"
                    variant="filled"
                    sx={{ width: "100%" }}
                  >
                    <h6>SELECT A TABLE TO OPEN RECEIPT</h6>
                  </Alert>
                </Box>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Menu;