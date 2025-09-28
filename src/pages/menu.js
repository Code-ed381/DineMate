import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceStrict } from "date-fns";

// MUI Components
import {
  TableContainer,
  Paper,
  CardMedia,
  CardActions,
  Table,
  TableHead,
  Grid,
  Skeleton,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Alert,
  OutlinedInput,
  InputLabel,
  FormControl,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Stack,
  Box,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  CardActionArea,
  Button,
  LinearProgress
} from '@mui/material';

// Icons
import {
  Search as SearchIcon,
  Cancel as CancelIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  KeyboardBackspace as KeyboardBackspaceIcon,
  PriceCheck as PriceCheckIcon,
  CreditScore as CreditScoreIcon,
  CurrencyPound as CurrencyPoundIcon,
  ProductionQuantityLimits as ProductionQuantityLimitsIcon,
  MenuBook as MenuBookIcon,
  TableRestaurant as TableRestaurantIcon,
  Upload as UploadIcon,
  ReceiptLong as ReceiptLongIcon,
  SoupKitchen as SoupKitchenIcon,
} from '@mui/icons-material';

// Store
import useMenuStore from  "../lib/menuStore";

// Components
import { printReceipt } from "../components/PrintWindow";
import MenuSkeleton from "../components/skeletons/menu-section-skeleton";


const Menu = () => {
  const navigate = useNavigate();
  const {
    assignedTables,
    setChosenTable,
    isSelectedTable,
    assignedTablesLoaded,
    tableSelected,
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
    getActiveSessionByRestaurant,
    setSelectedCategory,
    selectedCategory,
    filterMenuItemsByCategory,
    menuItems,
    loadingMenuItems,
    categories,
    fetchCategories,
    filteredMenuItems,
    fetchMenuItems,
    setFilteredMenuItems,
    chosenTableSession,
    chosenTableOrderItems,
    activeSessionByTableNumberLoaded,
    loadingActiveSessionByRestaurant,
    loadingActiveSessionByTableNumber,
    updateSessionStatus,
  } = useMenuStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getActiveSessionByRestaurant();
    fetchCategories();
    fetchMenuItems();
    return () => {
      controller.abort();
    };
  }, [getActiveSessionByRestaurant, fetchCategories, fetchMenuItems]); // Functions included in the dependency array

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
              mt={2}
              sx={{ alignItems: "center", justifyContent: "space-between", border: "2px double #ccc", borderRadius: 2, boxShadow: 3, p: 2 }}
            >
              <Typography variant="title" fontWeight="bold">
                ORDER NO. {chosenTableSession?.order_id}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatDateTime(chosenTableSession?.opened_at)}
              </Typography>
            </Stack>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 2, boxShadow: 3 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}><CancelIcon fontSize="small" color="error" /></TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                  </TableRow>
                </TableHead>

                {!loadingActiveSessionByTableNumber ? (
                  <>
                    {chosenTableOrderItems?.length > 0 ? (
                      <TableBody>
                        {chosenTableOrderItems?.map((item, index) => {
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleRemoveItem(item)}
                                  color="error"
                                  size="small"
                                  disabled={chosenTableSession?.session_status !== "open" || item?.item_status != "pending"}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
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
                            <ProductionQuantityLimitsIcon fontSize="small" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              No order items
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
                      <Typography variant="subtitle1">Subtotal</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">
                        {!loadingActiveSessionByTableNumber &&
                        activeSessionByTableNumberLoaded
                          ? chosenTableSession?.order_total?.toFixed(2)
                          : 0.00}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">Tax</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">
                        {!loadingActiveSessionByTableNumber &&
                        activeSessionByTableNumberLoaded
                          ? chosenTableSession?.order_total?.toFixed(2)
                          : 0.00}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">Discount</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="subtitle1">
                        {!loadingActiveSessionByTableNumber &&
                        activeSessionByTableNumberLoaded
                          ? chosenTableSession?.order_total?.toFixed(2)
                          : 0.00}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ border: "none" }}>
                    <TableCell colSpan={4} sx={{ py: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold" color="success">
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold" color="success">
                        {!loadingActiveSessionByTableNumber &&
                        activeSessionByTableNumberLoaded
                          ? chosenTableSession?.order_total?.toFixed(2)
                          : 0.00}
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
              <Typography variant='h2'><strong>&#163; {formatCashInput(chosenTableSession?.order_total)}</strong></Typography>

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

  // search filtering logic
  const searchFilter = useMemo(() => {
    return filteredMenuItems.filter((item) => {
      if (searchTerm === '') {
        return true;
      }

      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [filteredMenuItems, searchTerm]);

  // category handler
  const handleCategoryClick = async (category) => {
    await setSelectedCategory(category);

    if (category.name === selectedCategory) {
      setFilteredMenuItems(menuItems);

      setSelectedCategory('');
    } else {
      filterMenuItemsByCategory(category);
    }
  };

  // print bill
  const handlePrintReceipt = async (status) => {
    await updateSessionStatus(status);
    
    printReceipt(status);
  };
  
  return (
    <Box m={2}>
      {loadingActiveSessionByRestaurant ? (
        <MenuSkeleton />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={8} md={8} lg={8}>
            <Card>
              {assignedTables.length > 0 ? (
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
                              isSelectedTable(table) && tableSelected ? "contained" : "outlined"
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  value={searchTerm}
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

            {tableSelected === true && assignedTables.length > 0 && (
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
                    {searchFilter.length > 0 ? (
                      searchFilter.map((item, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                          <Card sx={{ height: "100%" }}>
                            <CardActionArea
                              onClick={() => addOrUpdateObject(item)}
                            >
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
                                      pr: 2,
                                    }}
                                  >
                                    {item.name}
                                  </Typography>

                                  <Typography
                                    variant="body1"
                                    fontWeight={900}
                                    sx={{
                                      whiteSpace: "nowrap",
                                      flexShrink: 0,
                                    }}
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
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 5,
                            color: "text.secondary",
                          }}
                        >
                          <CancelIcon
                            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                          />
                          <Typography variant="h6" gutterBottom>
                            No results found
                          </Typography>
                          <Typography variant="body2">
                            Try adjusting your search or browsing categories.
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            )}

            {tableSelected === false && assignedTables.length > 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  mt: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <UploadIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                <Alert severity="info" variant="basic">
                  Select A Table Above to View Menu Items
                </Alert>
              </Box>
            )}
          </Grid>

          <Grid item xs={4} md={4} lg={4}>
            {tableSelected ? (
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
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
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ width: "100%", m: 2 }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ padding: 4 }}
                          size="large"
                          // disabled={proceedToCheckOut === true}
                          startIcon={<ReceiptLongIcon />}
                          onClick={() => handlePrintReceipt("billed")}
                        >
                          Print Bill
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{ padding: 4 }}
                          size="large"
                          color="success"
                          disabled={
                            chosenTableSession?.session_status != "billed"
                          }
                          endIcon={<ShoppingCartCheckoutIcon />}
                          onClick={handleNext}
                        >
                          Proceed To CheckOut
                        </Button>
                      </Stack>
                    )}
                  </CardActions>
                )}
              </Card>
            ) : (
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Stepper */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 2,
                  }}
                >
                  <Skeleton variant="rectangular" width={150} height={30} />
                  <Skeleton variant="rectangular" width={150} height={30} />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Order info */}
                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>

                  {/* Order table rows */}
                  {[1, 2, 3, 4, 5].map((row) => (
                    <Box
                      key={row}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="text" width="20%" height={20} />
                    </Box>
                  ))}

                  {/* Totals */}
                  <Box
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      mt: 2,
                      pt: 2,
                    }}
                  >
                    {["Order Total", "Tax", "Discount", "Total"].map(
                      (label, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Skeleton variant="text" width="40%" height={20} />
                          <Skeleton variant="text" width="20%" height={20} />
                        </Box>
                      )
                    )}
                  </Box>
                </CardContent>

                {/* Checkout button */}
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="rectangular" height={50} width="100%" />
                </Box>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Menu;