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
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import MenuBook from "@mui/icons-material/MenuBook";
import Swal from "sweetalert2";
import useMenuItemsStore from "../../lib/menuItemsStore";
import { supabase } from "../../lib/supabase";
import useRestaurantStore from "../../lib/restaurantStore";
import CategoryItem from "../../components/category";
import AdminHeader from "../../components/admin-header";
import useAppStore from "../../lib/appstore";
import FAB from "../../components/fab";
import DataTable from "../../components/data-table";

const columns = [
  {
    field: "name",
    headerName: "Item",
    flex: 1,
    sortable: true,
    editable: true,
  },
  {
    field: "category",
    headerName: "Category",
    flex: 1,
    maxWidth: 120,
    sortable: true,
    renderCell: (params) => params.row.category_name || "Uncategorized",
  },
  {
    field: "price",
    headerName: "Price",
    flex: 1,
    maxWidth: 80,
    sortable: true,
    editable: true,
    renderCell: (params) => `$${params.row.price}`,
  },
  {
    field: "available",
    headerName: "Available",
    flex: 1,
    maxWidth: 130,
    sortable: true,
    editable: true,
    renderCell: (params) => (
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
    renderCell: (params) => {
      const tags = params.row?.tags;
      if (!tags || tags.length === 0) {
        return <span style={{ color: "#999" }}>—</span>;
      }

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center", // ✅ vertically center
            gap: "6px",
            flexWrap: "wrap",
            height: "100%", // ✅ take full height of cell
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
        </div>
      );
    },
  },
  {
    field: "actions",
    headerName: "Delete",
    sortable: false,
    editable: true,
    maxWidth: 80,
    align: "right",
    renderCell: (params) => (
      <>
        <IconButton
          color="error"
          onClick={() => console.log("Delete", params.row)}
        >
          <DeleteIcon />
        </IconButton>
      </>
    ),
  },
];

export default function MenuItemsManagement() {
  const [search, setSearch] = useState("");
  const { categories, fetchCategories, fetchMenuItems, menuItems } =
    useMenuItemsStore();
  const { selectedRestaurant } = useRestaurantStore();
  const { viewMode } = useAppStore();

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
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .swal2-popup .swal2-input:focus, 
      .swal2-popup .swal2-select:focus, 
      .swal2-popup .swal2-file:focus {
        border-color: #1976d2;
        box-shadow: 0 0 4px rgba(25, 118, 210, 0.3);
        outline: none;
      }
      .swal2-popup label {
        font-size: 13px;
        font-weight: 500;
        display: block;
        margin-top: 4px;
        margin-bottom: 4px;
        color: #444;
        text-align: left;
      }
    </style>

    <div class="form-grid">
      <div class="form-grid-full">
        <label for="swal-name">Name</label>
        <input id="swal-name" class="swal2-input" placeholder="E.g. Cheeseburger" />
      </div>

      <div>
        <label for="swal-price">Price</label>
        <input id="swal-price" type="number" class="swal2-input" placeholder="E.g. 9.99" />
      </div>

      <div>
        <label for="swal-category">Category</label>
        <select id="swal-category" class="swal2-select">
          ${categoryOptions}
        </select>
      </div>

      <div class="form-grid-full">
        <label for="swal-description">Description</label>
        <input id="swal-description" class="swal2-input" placeholder="Short description" />
      </div>

      <div>
        <label for="swal-available">Availability</label>
        <select id="swal-available" class="swal2-select">
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <div>
        <label for="swal-image">Upload Image</label>
        <input id="swal-image" type="file" accept="image/*" class="swal2-file" />
      </div>

      <div class="form-grid-full">
        <label>Tags (max 3)</label>
        <div style="display: flex; gap: 8px;">
          <input id="swal-tag1" class="swal2-input" placeholder="Tag 1" />
          <input id="swal-tag2" class="swal2-input" placeholder="Tag 2" />
          <input id="swal-tag3" class="swal2-input" placeholder="Tag 3" />
        </div>
      </div>
    </div>
  `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Item",
      cancelButtonText: "Cancel",
      preConfirm: async () => {
        const name = document.getElementById("swal-name").value.trim();
        const description = document
          .getElementById("swal-description")
          .value.trim();
        const price = document.getElementById("swal-price").value.trim();
        const category_id = document.getElementById("swal-category").value;
        const available =
          document.getElementById("swal-available").value === "true";

        const tag1 = document.getElementById("swal-tag1").value.trim();
        const tag2 = document.getElementById("swal-tag2").value.trim();
        const tag3 = document.getElementById("swal-tag3").value.trim();

        const fileInput = document.getElementById("swal-image");
        const file = fileInput.files[0];

        if (!name || !price || !category_id) {
          Swal.showValidationMessage("⚠️ Please fill all required fields.");
          return false;
        }

        let image_url = null;
        if (file) {
          try {
            const filePath = `items/${Date.now()}_${file.name.replace(
              /\s+/g,
              "_"
            )}`;
            const { error: uploadError } = await supabase.storage
              .from("menu")
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
              .from("menu")
              .getPublicUrl(filePath);
            image_url = data.publicUrl;
          } catch (err) {
            Swal.showValidationMessage(
              `⚠️ Image upload failed: ${err.message}`
            );
            return false;
          }
        }

        // Build tags array (remove empty values, max 3)
        const tags = [tag1, tag2, tag3].filter(Boolean).slice(0, 3);

        return {
          name,
          description,
          price: parseFloat(price),
          category_id,
          image_url,
          available,
          tags,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newItem = result.value;

        const { error } = await supabase
          .from("menu_items")
          .insert([
            {
              restaurant_id: selectedRestaurant.restaurants.id,
              name: newItem.name,
              description: newItem.description,
              price: newItem.price,
              category_id: newItem.category_id,
              image_url: newItem.image_url,
              available: newItem.available,
              tags: newItem.tags, // 👈 jsonb field
            },
          ])
          .select();

        if (error) {
          Swal.fire("Error", error.message, "error");
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Item Added",
          text: `${newItem.name} has been created.`,
        });
      }
    });
  };

  const handleAddCategory = () => {
    Swal.fire({
      title: "➕ Add New Category",
      width: "500px",
      html: `
        <style>
          .swal2-popup .swal2-input {
            width: 100% !important;
            margin: 8px 0 16px; /* 👈 extra bottom spacing */
            font-size: 15px;
            padding: 10px 12px;
          }
          .swal2-popup .swal2-radio-group {
            margin-top: 20px; /* 👈 more space from top */
            display: flex;
            gap: 24px; /* 👈 spacing between options */
          }
          .swal2-popup .swal2-radio-group label {
            font-size: 16px; /* 👈 bigger label text */
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
          }
          .swal2-popup .swal2-radio-group input[type="radio"] {
            width: 18px; /* 👈 bigger radio button */
            height: 18px;
            cursor: pointer;
          }
        </style>

        <input id="swal-category" class="swal2-input" placeholder="Category Name" />

        <div class="swal2-radio-group">
          <label><input type="radio" name="swal-type" value="food" checked /> Food</label>
          <label><input type="radio" name="swal-type" value="drink" /> Drink</label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Category",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const category = document.getElementById("swal-category").value.trim();
        const type = document.querySelector(
          "input[name='swal-type']:checked"
        ).value;

        if (!category) {
          Swal.showValidationMessage("⚠️ Please fill all required fields.");
          return false;
        }

        return { category, type };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newCategory = result.value;

        const { error } = await supabase
          .from("menu_categories")
          .insert([
            {
              restaurant_id: selectedRestaurant.restaurants.id,
              name: newCategory.category,
              type: newCategory.type,
            },
          ])
          .select();

        if (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to add category.",
          });
          return;
        }

        fetchCategories();
      }
    });
  };

  const handleEditCategory = (category) => {};

  const handleDeleteCategory = (category) => {};

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <AdminHeader
        title="Menu Management"
        description="Manage your restaurant menu, track availability, and update reservations"
      />

      {/* Main Content */}
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Sidebar for Categories */}
        <Box
          sx={((theme)=>({
            width: 300,
            borderRight: "1px solid #eee",
            p: 2,
          }))}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Categories
            </Typography>

            <Tooltip title="Add Category">
              <IconButton
                size="large"
                sx={{ border: "1px solid #ccc" }}
                onClick={handleAddCategory}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {categories.length > 0 ? (
            <List>
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  handleEditCategory={handleEditCategory}
                  handleDeleteCategory={handleDeleteCategory}
                />
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
              No categories found.
            </Typography>
          )}
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {/* Header Row: title (left, optional) + search (right) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
              sx={{
                width: { xs: "100%", md: 300 }, // responsive width
              }}
            />
          </Box>

          {/* Grid View */}
          {viewMode === "card" && (
            <Grid container spacing={3}>
              {menuItems.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={item.image_url}
                      alt={item.name}
                    />
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      {/* Title + Price */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          fontSize={16}
                          sx={{
                            flex: 1,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          ${item.price}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Category + Availability */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          size="small"
                          label={item.category_name}
                          color="primary"
                        />
                        <Chip
                          size="small"
                          sx={{ my: 1 }}
                          label={item.available ? "Available" : "Out of Stock"}
                          color={item.available ? "success" : "error"}
                        />
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Tags */}
                      <Box
                        sx={{
                          my: 1,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="subtitle2">Tags</Typography>
                        <Box>
                          {item.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={tag}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                          mt: "auto",
                        }}
                      >
                        <Button
                          startIcon={<EditIcon />}
                          fullWidth
                          color="primary"
                        >
                          Edit
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          fullWidth
                          color="error"
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <DataTable
              rows={menuItems}
              columns={columns}
              showToolbar
              pageSize={10}
              pageSizeOptions={[5, 10, 25]}
            />
          )}

          {/* Empty state */}
          {menuItems.length === 0 && viewMode === "card" && (
            <Box sx={{ textAlign: "center", mt: 20 }}>
              <MenuBook sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Items found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add a new item by clicking the + button below
              </Typography>
            </Box>
          )}
        </Box>

        {/* Floating Action Button */}
        <FAB handleAdd={() => handleAddMenuItem()} title="Add Menu Item" />
      </Box>
    </Box>
  );
}
