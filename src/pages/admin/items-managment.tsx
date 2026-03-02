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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import useMenuItemsStore from "../../lib/menuItemsStore";
import useRestaurantStore from "../../lib/restaurantStore";
import CategoryItem from "../../components/category";
import AdminHeader from "../../components/admin-header";
import FAB from "../../components/fab";
import DataTable from "../../components/data-table";
import { useSettingsStore } from "../../lib/settingsStore";
import { formatCurrency, getCurrencySymbol } from "../../utils/currency";

import { GridColDef } from "@mui/x-data-grid";

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
  } = useMenuItemsStore();
  const { viewMode } = useSettingsStore();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchCategories, fetchMenuItems]);

  const handleAddMenuItem = () => {
    const categoryOptions = categories
      .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");

    Swal.fire({
      title: "➕ Add New Menu Item",
      width: "900px",
      html: `
        <style>
          .swal2-popup .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
           .swal2-popup .form-grid-full {
            grid-column: span 2;
          }
          .swal2-popup .swal2-input, 
          .swal2-popup .swal2-select, 
          .swal2-popup .swal2-file {
            width: 100% !important;
            margin: 6px 0;
            padding: 10px 12px;
            font-size: 14px;
            border-radius: 8px;
            border: 1px solid #ccc;
          }
        </style>
        <div class="form-grid">
          <div class="form-grid-full">
            <label>Name</label>
            <input id="swal-name" class="swal2-input" placeholder="E.g. Cheeseburger" />
          </div>
          <div>
            <label>Price</label>
            <input id="swal-price" type="number" step="0.01" class="swal2-input" placeholder="E.g. 9.99" />
          </div>
          <div>
            <label>Category</label>
            <select id="swal-category" class="swal2-select">
              <option value="" disabled selected>Select Category</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="form-grid-full">
            <label>Description</label>
            <input id="swal-description" class="swal2-input" placeholder="Short description" />
          </div>
          <div>
            <label>Availability</label>
            <select id="swal-available" class="swal2-select">
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
          <div>
            <label>Upload Image</label>
            <input id="swal-image" type="file" accept="image/*" class="swal2-file" />
          </div>
          <div class="form-grid-full">
            <label>Tags (comma separated)</label>
            <input id="swal-tags" class="swal2-input" placeholder="spicy, vegan, gluten-free" />
          </div>
        </div>
      `,
      focusConfirm: false,
      preConfirm: async () => {
        const name = (document.getElementById("swal-name") as HTMLInputElement).value.trim();
        const price = (document.getElementById("swal-price") as HTMLInputElement).value.trim();
        const category_id = (document.getElementById("swal-category") as HTMLSelectElement).value;
        const description = (document.getElementById("swal-description") as HTMLInputElement).value.trim();
        const available = (document.getElementById("swal-available") as HTMLSelectElement).value;
        const imageInput = document.getElementById("swal-image") as HTMLInputElement;
        const tagsInput = (document.getElementById("swal-tags") as HTMLInputElement).value.trim();

        if (!name || !price || !category_id) {
          Swal.showValidationMessage("Please fill in Name, Price, and Category");
          return false;
        }

        const tags = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : [];
        const imageFile = imageInput.files ? imageInput.files[0] : undefined;

        await addMenuItem({
            name,
            price,
            category_id,
            description,
            available,
            tags
        }, imageFile);
      }
    });
  };

  const handleEditItem = (item: any) => {
    const categoryOptions = categories
      .map((cat) => `<option value="${cat.id}" ${cat.id === item.category ? "selected" : ""}>${cat.name}</option>`)
      .join("");

    Swal.fire({
      title: "✏️ Edit Menu Item",
      width: "900px",
      html: `
        <style>
          .swal2-popup .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
           .swal2-popup .form-grid-full {
            grid-column: span 2;
          }
          .swal2-popup .swal2-input, 
          .swal2-popup .swal2-select, 
          .swal2-popup .swal2-file {
            width: 100% !important;
            margin: 6px 0;
            padding: 10px 12px;
            font-size: 14px;
            border-radius: 8px;
            border: 1px solid #ccc;
          }
        </style>
        <div class="form-grid">
          <div class="form-grid-full">
            <label>Name</label>
            <input id="swal-name" class="swal2-input" value="${item.name || item.item_name}" />
          </div>
          <div>
            <label>Price</label>
            <input id="swal-price" type="number" step="0.01" class="swal2-input" value="${item.price}" />
          </div>
          <div>
            <label>Category</label>
            <select id="swal-category" class="swal2-select">
              ${categoryOptions}
            </select>
          </div>
          <div class="form-grid-full">
            <label>Description</label>
            <input id="swal-description" class="swal2-input" value="${item.description || ""}" />
          </div>
          <div>
            <label>Availability</label>
            <select id="swal-available" class="swal2-select">
              <option value="true" ${item.available ? "selected" : ""}>Available</option>
              <option value="false" ${!item.available ? "selected" : ""}>Unavailable</option>
            </select>
          </div>
          <div>
            <label>Change Image (Optional)</label>
            <input id="swal-image" type="file" accept="image/*" class="swal2-file" />
          </div>
          <div class="form-grid-full">
            <label>Tags (comma separated)</label>
            <input id="swal-tags" class="swal2-input" value="${(item.tags || []).join(", ")}" />
          </div>
        </div>
      `,
      focusConfirm: false,
      preConfirm: async () => {
        const name = (document.getElementById("swal-name") as HTMLInputElement).value.trim();
        const price = (document.getElementById("swal-price") as HTMLInputElement).value.trim();
        const category_id = (document.getElementById("swal-category") as HTMLSelectElement).value;
        const description = (document.getElementById("swal-description") as HTMLInputElement).value.trim();
        const available = (document.getElementById("swal-available") as HTMLSelectElement).value;
        const imageInput = document.getElementById("swal-image") as HTMLInputElement;
        const tagsInput = (document.getElementById("swal-tags") as HTMLInputElement).value.trim();

        if (!name || !price || !category_id) {
          Swal.showValidationMessage("Please fill in Name, Price, and Category");
          return false;
        }

        const tags = tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : [];
        const imageFile = imageInput.files ? imageInput.files[0] : undefined;

        await updateMenuItem(item.id, {
            name,
            price,
            category_id,
            description,
            available,
            tags,
            image_url: item.image_url // Pass existing URL to preserve it if no new file
        }, imageFile);
      }
    });
  };

  const handleDeleteItem = (id: string) => {
      deleteMenuItem(id);
  };
  
  // Update columns to use handleDeleteItem and dynamic currency header
  const updatedColumns = baseColumns.map(col => {
      if (col.field === 'price') {
          return { ...col, headerName: `Price (${getCurrencySymbol()})` };
      }
      if (col.field === 'actions') {
          return {
              ...col,
              headerName: "Actions",
              width: 120, // Increased width for two buttons
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
      // Add Category logic
  };

  const handleEditCategory = (id: string) => {
      console.log("Edit category", id);
  };

  const handleDeleteCategory = (id: string) => {
      console.log("Delete category", id);
  };

  return (
    <Box sx={{ p: 2 }}>
      <AdminHeader
        title="Menu Management"
        description="Manage your restaurant menu, track availability, and update reservations"
      />

      <Box sx={{ display: "flex", minHeight: "80vh" }}>
        <Box sx={{ flex: "0 0 18%", borderRight: "1px solid #eee", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Categories</Typography>
                <IconButton onClick={handleAddCategory}><AddIcon /></IconButton>
            </Box>
            <List>
                {categories.map((cat) => (
                    <CategoryItem 
                      key={cat.id} 
                      category={cat} 
                      handleEditCategory={handleEditCategory}
                      handleDeleteCategory={handleDeleteCategory}
                    />
                ))}
            </List>
        </Box>

        <Box sx={{ flexGrow: 1, p: 3 }}>
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



           {viewMode === "grid" && (
               <Grid container spacing={3}>
                   {filteredMenuItems.map((item) => (
                       <Grid item xs={12} sm={6} md={3} key={item.id}>
                           <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                               <CardMedia component="img" height="140" image={item.image_url} alt={item.name} />
                               <CardContent sx={{ flexGrow: 1 }}>
                                   <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                                   <Typography variant="body2" color="text.secondary">{formatCurrency(item.price)}</Typography>
                               </CardContent>
                               <Divider />
                               <Box sx={{ p: 1, display: "flex", justifyContent: "space-between" }}>
                                   <Button size="small" startIcon={<EditIcon />} onClick={() => handleEditItem(item)}>Edit</Button>
                                   <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteItem(item.id)}>Delete</Button>
                               </Box>
                           </Card>
                       </Grid>
                   ))}
               </Grid>
           )}

           {viewMode === "list" && (
               <DataTable rows={filteredMenuItems} columns={updatedColumns} />
           )}
        </Box>
      </Box>
      <FAB handleAdd={handleAddMenuItem} title="Add Item" />
    </Box>
  );
};

export default MenuItemsManagement;
