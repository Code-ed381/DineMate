import React, { useState } from "react";
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useMenuItemsStore from "../lib/menuItemsStore";


const CategoryItem = ({
  category,
  handleEditCategory,
  handleDeleteCategory,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    setSelectedCategory,
    isSelectedCategory,
  } = useMenuItemsStore();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ListItem disablePadding sx={{ py: 1 }}>
      <ListItemButton
        selected={isSelectedCategory(category.name)}
        onClick={() => setSelectedCategory(category.name)}
      >
        <ListItemText primary={category.name} />
      </ListItemButton>

      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>

        <Menu open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              handleEditCategory(category.id);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleDeleteCategory(category.id);
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default CategoryItem;
