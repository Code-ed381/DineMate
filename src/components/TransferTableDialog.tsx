import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  ListItemIcon, 
  Typography,
  Box,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  TableRestaurant, 
  MoveUp, 
  Search,
  CheckCircleOutline
} from '@mui/icons-material';
import { RestaurantTable } from '../lib/tablesStore';

interface TransferTableDialogProps {
  open: boolean;
  onClose: () => void;
  onTransfer: (destTableId: string) => Promise<void>;
  availableTables: RestaurantTable[];
  sourceTableNumber: number | string;
}

const TransferTableDialog: React.FC<TransferTableDialogProps> = ({ 
  open, 
  onClose, 
  onTransfer, 
  availableTables,
  sourceTableNumber
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredTables = availableTables.filter(t => 
    t.table_number.toString().includes(searchTerm)
  );

  const handleTransfer = async () => {
    if (!selectedTableId) return;
    setLoading(true);
    try {
      await onTransfer(selectedTableId);
      onClose();
    } finally {
      setLoading(false);
      setSelectedTableId(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
        <MoveUp color="primary" />
        Transfer Table {sourceTableNumber}
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the destination table where you want to move the current session and order.
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search table number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <ListItem 
                key={table.id}
                disablePadding
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  onClick={() => setSelectedTableId(table.id)}
                  selected={selectedTableId === table.id}
                  sx={{ 
                    borderRadius: 2, 
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon>
                    <TableRestaurant color={selectedTableId === table.id ? 'inherit' : 'action'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Table ${table.table_number}`} 
                    secondary={`${table.capacity || 0} seats`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                  {selectedTableId === table.id && <CheckCircleOutline />}
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No available tables found.
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleTransfer} 
          disabled={!selectedTableId || loading}
          startIcon={loading ? null : <MoveUp />}
        >
          {loading ? 'Transferring...' : 'Confirm Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferTableDialog;
