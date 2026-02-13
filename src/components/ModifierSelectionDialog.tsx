import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  Radio,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip
} from '@mui/material';
import { MenuItem, ModifierGroup, Modifier } from '../types/menu';

interface Props {
  open: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onConfirm: (selected: Modifier[]) => void;
  currencySymbol: string;
}

const ModifierSelectionDialog: React.FC<Props> = ({ open, onClose, item, onConfirm, currencySymbol }) => {
  const [selections, setSelections] = useState<Record<string, Modifier[]>>({});

  useEffect(() => {
    if (open) {
      setSelections({});
    }
  }, [open, item]);

  const handleToggle = (group: ModifierGroup, modifier: Modifier) => {
    const groupSelections = selections[group.id] || [];
    const isSelected = groupSelections.some(m => m.id === modifier.id);

    if (group.max_selection === 1) {
      // Radio mode
      setSelections({
        ...selections,
        [group.id]: isSelected ? [] : [modifier]
      });
    } else {
      // Checkbox mode
      if (isSelected) {
        setSelections({
          ...selections,
          [group.id]: groupSelections.filter(m => m.id !== modifier.id)
        });
      } else {
        if (group.max_selection && groupSelections.length >= group.max_selection) {
          return; // Max reached
        }
        setSelections({
          ...selections,
          [group.id]: [...groupSelections, modifier]
        });
      }
    }
  };

  const totalPrice = useMemo(() => {
    if (!item) return 0;
    const modifierTotal = Object.values(selections)
      .flat()
      .reduce((sum, m) => sum + (m.price_adjustment || 0), 0);
    return item.price + modifierTotal;
  }, [item, selections]);

  const isValid = useMemo(() => {
    if (!item?.modifier_groups) return true;
    return item.modifier_groups.every(group => {
      const count = (selections[group.id] || []).length;
      if (group.min_selection > 0 && count < group.min_selection) return false;
      return true;
    });
  }, [item, selections]);

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{item.name}</Typography>
          <Typography color="primary" fontWeight="bold">
            {currencySymbol}{totalPrice.toFixed(2)}
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {item.modifier_groups?.map((group) => (
          <Box key={group.id} mb={3}>
            <Typography variant="subtitle1" fontWeight="bold">
              {group.name}
              {group.min_selection > 0 && (
                <Chip 
                  label="Required" 
                  size="small" 
                  color="secondary" 
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {group.max_selection === 1 
                ? 'Select one' 
                : group.max_selection 
                  ? `Select up to ${group.max_selection}` 
                  : 'Select any'}
            </Typography>
            
            <List dense>
              {group.modifiers?.map((mod) => (
                <ListItem 
                  key={mod.id} 
                  disablePadding
                >
                  <ListItemButton 
                    onClick={() => handleToggle(group, mod)}
                    disabled={!mod.is_available}
                  >
                    <Box display="flex" width="100%" alignItems="center">
                      {group.max_selection === 1 ? (
                        <Radio checked={selections[group.id]?.some(m => m.id === mod.id) || false} />
                      ) : (
                        <Checkbox checked={selections[group.id]?.some(m => m.id === mod.id) || false} />
                      )}
                      <ListItemText 
                        primary={mod.name} 
                        secondary={mod.price_adjustment !== 0 ? `+${currencySymbol}${mod.price_adjustment.toFixed(2)}` : null} 
                      />
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={() => onConfirm(Object.values(selections).flat())} 
          variant="contained" 
          disabled={!isValid}
        >
          Add to Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModifierSelectionDialog;
