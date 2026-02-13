import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Tab,
  Tabs,
  TextField,
  IconButton,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import { OrderItem } from '../types/menu';

interface Props {
  open: boolean;
  onClose: () => void;
  items: OrderItem[];
  currencySymbol: string;
  onPayPartial: (itemIds: string[], cash: number, card: number) => Promise<void>;
  onPayEqual: (amount: number, cash: number, card: number) => Promise<void>;
}

const SplitBillDialog: React.FC<Props> = ({ open, onClose, items, currencySymbol, onPayPartial, onPayEqual }) => {
  const [tab, setTab] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [numGuests, setNumGuests] = useState<number>(2);
  const [cash, setCash] = useState<string>('');
  const [card, setCard] = useState<string>('');

  const unpaidItems = useMemo(() => items.filter(i => i.payment_status !== 'completed'), [items]);
  const totalUnpaid = useMemo(() => unpaidItems.reduce((sum, i) => sum + (i.sum_price || 0), 0), [unpaidItems]);

  const selectedTotal = useMemo(() => 
    unpaidItems.filter(i => selectedIds.includes(i.id)).reduce((sum, i) => sum + (i.sum_price || 0), 0)
  , [unpaidItems, selectedIds]);

  const equalSplitAmount = useMemo(() => totalUnpaid / (numGuests || 1), [totalUnpaid, numGuests]);

  const handleToggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const currentTotalToPay = tab === 0 ? selectedTotal : equalSplitAmount;

  const handlePay = async () => {
    const cashVal = parseFloat(cash) || 0;
    const cardVal = parseFloat(card) || 0;
    
    if (tab === 0) {
      await onPayPartial(selectedIds, cashVal, cardVal);
      setSelectedIds([]);
    } else {
      await onPayEqual(equalSplitAmount, cashVal, cardVal);
    }
    setCash('');
    setCard('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Split Bill</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mt: 1 }}>
          <Tab icon={<CartIcon />} label="Split by Item" />
          <Tab icon={<PersonIcon />} label="Split Equally" />
        </Tabs>
      </DialogTitle>
      
      <DialogContent dividers>
        {tab === 0 ? (
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Select items for this payment:
            </Typography>
            <List>
              {unpaidItems.map((item) => (
                <ListItem key={item.id} disablePadding divider>
                  <ListItemButton onClick={() => handleToggle(item.id)}>
                    <Checkbox checked={selectedIds.includes(item.id)} />
                    <ListItemText 
                      primary={`${item.quantity}x ${item.item_name || item.name}`} 
                      secondary={item.notes ? `Note: ${item.notes}` : null}
                    />
                    <Typography fontWeight="bold">
                      {currencySymbol}{(item.sum_price || 0).toFixed(2)}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {unpaidItems.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">All items have been paid!</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box py={2}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Split total remaining ({currencySymbol}{totalUnpaid.toFixed(2)}) equally:
            </Typography>
            <TextField
              fullWidth
              label="Number of Guests"
              type="number"
              value={numGuests}
              onChange={(e) => setNumGuests(Math.max(1, parseInt(e.target.value) || 1))}
              sx={{ my: 2 }}
            />
            <Box textAlign="center" p={3} bgcolor="action.hover" borderRadius={2}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {currencySymbol}{equalSplitAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per Guest
              </Typography>
            </Box>
          </Box>
        )}

        <Box mt={3} p={2} bgcolor="background.paper" borderRadius={2} border="1px solid" borderColor="divider">
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Payment for this split: {currencySymbol}{currentTotalToPay.toFixed(2)}
          </Typography>
          <Stack direction="row" spacing={2} mt={1}>
            <TextField 
              fullWidth 
              label="Cash" 
              placeholder="0.00" 
              value={cash} 
              onChange={(e) => setCash(e.target.value)}
            />
            <TextField 
              fullWidth 
              label="Card" 
              placeholder="0.00" 
              value={card} 
              onChange={(e) => setCard(e.target.value)}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handlePay}
          disabled={currentTotalToPay === 0 || (tab === 0 && selectedIds.length === 0)}
          sx={{ minWidth: 150, borderRadius: 2 }}
        >
          Pay {currencySymbol}{currentTotalToPay.toFixed(2)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitBillDialog;
