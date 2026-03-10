import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  Avatar,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Pagination,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { Download, FileDownload, Print } from "@mui/icons-material";
import useMenuItemsStore from "../../lib/menuItemsStore";
import CategoryItem from "../../components/category";
import AdminHeader from "../../components/admin-header";
import FAB from "../../components/fab";
import DataTable from "../../components/data-table";
import EmptyState from "../../components/empty-state";
import { useSettingsStore } from "../../lib/settingsStore";
import { formatCurrency, getCurrencySymbol } from "../../utils/currency";
import MenuItemDialog from "../../components/MenuItemDialog";
import CategoryDialog from "../../components/CategoryDialog";
import { useFeatureGate } from "../../hooks/useFeatureGate";
import UpgradeModal from "../../components/UpgradeModal";
import Swal from "sweetalert2";
import { GridColDef } from "@mui/x-data-grid";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";

const baseColumns: GridColDef[] = [
  {
    field: "image_url",
    headerName: "Image",
    width: 90,  
    sortable: false,
    renderCell: (params: any) => (
      <Avatar alt={params.row.name} src={params.row.image_url} />
    ),
  },
  {
    field: "name",
    headerName: "Item",
    flex: 1,
    sortable: true,
    editable: true,
  },
  {
    field: "description",
    headerName: "Description",
    flex: 1.5,
    sortable: true,
    renderCell: (params: any) => params.row.description || "—",
  },
  {
    field: "category_name",
    headerName: "Category",
    flex: 1,
    maxWidth: 120,
    sortable: true,
    renderCell: (params: any) => params.row.category_name || "Uncategorized",
  },
  {
    field: "price",
    headerName: "Price",
    flex: 1,
    maxWidth: 120,
    sortable: true,
    editable: true,
    renderCell: (params: any) => Number(params.row.price || 0).toFixed(2),
  },
  {
    field: "available",
    headerName: "Available",
    flex: 1,
    maxWidth: 130,
    sortable: true,
    editable: true,
    renderCell: (params: any) => (
      <Chip
        label={params.row.available ? "Available" : "Not Available"}
        color={params.row.available ? "success" : "error"}
        size="small"
      />
    ),
  },
  {
    field: "tags",
    headerName: "Tags",
    flex: 1,
    maxWidth: 250,
    sortable: false,
    renderCell: (params: any) => {
      const tags = params.row?.tags as string[];
      if (!tags || tags.length === 0) {
        return <span style={{ color: "#999" }}>—</span>;
      }

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
            height: "100%",
          }}
        >
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      );
    },
  },
  {
    field: "actions",
    headerName: "Delete",
    sortable: false,
    editable: true,
    maxWidth: 120,
    align: "right",
    renderCell: (params: any) => (
        <IconButton
          color="error"
        >
          <DeleteIcon />
        </IconButton>
    ),
  },
];

const MenuItemsManagement: React.FC = () => {
  const {
    categories,
    fetchCategories,
    fetchMenuItems,
    menuItems,
    setSelectedCategory,
    selectedCategory,
    filteredMenuItems,
    searchQuery,
    setSearchQuery,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenuItemsStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [page, setPage] = useState(1);
  const cardsPerPage = 8;
  const pageCount = Math.ceil(filteredMenuItems.length / cardsPerPage);
  const paginatedMenuItems = filteredMenuItems.slice((page - 1) * cardsPerPage, page * cardsPerPage);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { canUseFeature, isLimitReached, plan } = useFeatureGate();
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => setExportAnchorEl(e.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);

  const handleExportCSV = () => {
    if (!canUseFeature("canUseCsvExport")) {
      handleExportClose();
      Swal.fire("Upgrade Required", "Please upgrade your plan to export data to CSV.", "info");
      return;
    }
    const dataToExport = filteredMenuItems.map(item => ({
        Name: item.name,
        Description: item.description || 'N/A',
        Category: item.category_name || 'Uncategorized',
        Price: item.price,
        Available: item.available ? 'Yes' : 'No',
        Tags: (item.tags as string[] || []).join(', ')
    }));
    exportToCSV(dataToExport, "restaurant_menu_items");
    handleExportClose();
  };

  const handleExportPDF = () => {
    exportToPDF();
    handleExportClose();
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchCategories, fetchMenuItems]);

  const handleAddMenuItem = () => {
    if (isLimitReached("maxMenuItems", menuItems.length)) {
      Swal.fire({
        title: "Menu Item Limit Reached",
        text: `Your plan allows up to ${plan.limits.maxMenuItems} menu items. Please upgrade to add more.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Upgrade Now",
        cancelButtonText: "Later"
      }).then((res) => {
        if (res.isConfirmed) setOpenUpgradeModal(true);
      });
      return;
    }
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    if (!canUseFeature("Add Menu Items")) {
      Swal.fire("Upgrade Required", "Please upgrade your plan to edit menu items.", "info");
      return;
    }
    setEditingItem(item);
    setDialogOpen(true);
  };



  const handleDialogSubmit = async (data: any, imageFile?: File) => {
    if (editingItem) {
      await updateMenuItem(editingItem.id, data, imageFile);
    } else {
      await addMenuItem(data, imageFile);
    }
  };

  const handleDeleteItem = (id: string) => {
    deleteMenuItem(id);
  };
  
  const updatedColumns = baseColumns.map(col => {
    if (col.field === 'price') {
      return { ...col, headerName: `Price (${getCurrencySymbol()})` };
    }
    if (col.field === 'actions') {
      return {
        ...col,
        headerName: "Actions",
        width: 120,
        renderCell: (params: any) => (
          <Box>
            <IconButton
              color="primary"
              onClick={() => handleEditItem(params.row)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleDeleteItem(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ),
      };
    }
    return col;
  });

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (id: string) => {
    const cat = categories.find((c: any) => c.id === id);
    if (cat) {
      setEditingCategory(cat);
      setCategoryDialogOpen(true);
    }
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
  };

  const handleCategorySubmit = async (name: string) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, name);
    } else {
      await addCategory(name);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <AdminHeader
        title="Menu Management"
        description="Manage your restaurant menu, track availability, and update reservations"
      >
        <Box>
            <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExportClick}
                sx={{ borderRadius: 2 }}
            >
                Export
            </Button>
            <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={handleExportClose}
            >
                <MenuItem onClick={handleExportCSV}>
                    <ListItemIcon><FileDownload fontSize="small" /></ListItemIcon>
                    Export CSV
                </MenuItem>
                <MenuItem onClick={handleExportPDF}>
                    <ListItemIcon><Print fontSize="small" /></ListItemIcon>
                    Print PDF (Browser)
                </MenuItem>
            </Menu>
        </Box>
      </AdminHeader>

      {/* Mobile: horizontal category chips */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Categories</Typography>
            <IconButton size="small" onClick={handleAddCategory}><AddIcon /></IconButton>
          </Box>
          <Box sx={{ 
            display: "flex", 
            gap: 1, 
            overflowX: "auto", 
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'divider' }
          }}>
            <Chip 
              label="All" 
              variant={!selectedCategory ? "filled" : "outlined"}
              color={!selectedCategory ? "primary" : "default"}
              onClick={() => setSelectedCategory("")}
              sx={{ flexShrink: 0 }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                variant={selectedCategory === cat.name ? "filled" : "outlined"}
                color={selectedCategory === cat.name ? "primary" : "default"}
                onClick={() => setSelectedCategory(cat.name)}
                onDelete={() => handleDeleteCategory(cat.id)}
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Box>
          {categories.length === 0 && (
            <EmptyState 
              title="No Categories" 
              description="Add a category to organize your menu."
              emoji="📁"
              height={150}
            />
          )}
          <TextField
            size="small"
            fullWidth
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mt: 1 }}
          />
        </Box>
      )}

      {/* Desktop: sidebar + content */}
      <Box sx={{ display: "flex", minHeight: "80vh" }}>
        {!isMobile && (
          <Box sx={{ flex: "0 0 18%", borderRight: "1px solid #eee", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Categories</Typography>
              <IconButton onClick={handleAddCategory}><AddIcon /></IconButton>
            </Box>
            <List>
              {categories.length === 0 ? (
                 <EmptyState 
                    title="No Categories" 
                    description="Add categories to manage your menu items properly."
                    emoji="📁"
                    height={300}
                 />
              ) : (
                categories.map((cat) => (
                  <CategoryItem 
                    key={cat.id} 
                    category={cat} 
                    handleEditCategory={handleEditCategory}
                    handleDeleteCategory={handleDeleteCategory}
                  />
                ))
              )}
            </List>
          </Box>
        )}

        <Box sx={{ flexGrow: 1, p: isMobile ? 0 : 3 }}>
          {!isMobile && (
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              {selectedCategory && (
                <Chip label={selectedCategory} onDelete={() => setSelectedCategory("")} />
              )}
              <TextField
                size="small"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {isMobile && (
            <Grid container spacing={2}>
              {filteredMenuItems.length === 0 ? (
                <Grid item xs={12}>
                  <EmptyState
                    title="No Items Found"
                    description="Try adjusting your search or filters, or add a new menu item."
                    emoji="🍴"
                    height={300}
                  />
                </Grid>
              ) : (
                paginatedMenuItems.map((item) => (
                  <Grid item xs={6} sm={6} key={item.id}>
                    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <CardMedia component="img" height="120" image={item.image_url} alt={item.name} />
                      <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatCurrency(item.price)}</Typography>
                      </CardContent>
                      <Divider />
                      <Box sx={{ px: 0.5, py: 0.5, display: "flex", justifyContent: "space-between" }}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditItem(item)} sx={{ fontSize: '0.7rem', minWidth: 0 }}>Edit</Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteItem(item.id)} sx={{ fontSize: '0.7rem', minWidth: 0 }}>Del</Button>
                      </Box>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {!isMobile && (
            filteredMenuItems.length === 0 ? (
              <EmptyState
                title="No Items Found"
                description="Try adjusting your search or filters, or add a new menu item."
                emoji="🍴"
                height={400}
              />
            ) : (
              <DataTable 
                rows={filteredMenuItems} 
                columns={updatedColumns} 
                sx={{ minHeight: 400 }}
              />
            )
          )}

          {isMobile && pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
              <Pagination count={pageCount} page={page} onChange={(e, p) => setPage(p)} color="primary" />
            </Box>
          )}
        </Box>
      </Box>

      <FAB handleAdd={handleAddMenuItem} title="Add Item" />

      <MenuItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        categories={categories}
        item={editingItem}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onSubmit={handleCategorySubmit}
        category={editingCategory}
      />

      <UpgradeModal 
        open={openUpgradeModal} 
        onClose={() => setOpenUpgradeModal(false)} 
      />
    </Box>
  );
};

export default MenuItemsManagement;
