import * as React from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  InputAdornment,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  TableRestaurant as TableRestaurantIcon,
  SoupKitchen as SoupKitchenIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  PriceCheck as PriceCheckIcon,
  LocalBar as LocalBarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useRestaurantStore from '../lib/restaurantStore';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  role?: string[];
}

const COMMANDS: Command[] = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { id: 'menu', label: 'Open Menu', icon: <MenuBookIcon />, path: '/app/menu', role: ['waiter'] },
  { id: 'tables', label: 'Table Management', icon: <TableRestaurantIcon />, path: '/app/tables', role: ['waiter', 'owner', 'admin'] },
  { id: 'bar', label: 'Bar Panel', icon: <LocalBarIcon />, path: '/app/bar', role: ['bartender'] },
  { id: 'kitchen', label: 'Kitchen Panel', icon: <SoupKitchenIcon />, path: '/app/kitchen', role: ['chef'] },
  { id: 'cashier', label: 'Cashier Checkout', icon: <PriceCheckIcon />, path: '/app/cashier', role: ['cashier'] },
  { id: 'audit', label: 'Audit Logs', icon: <AssessmentIcon />, path: '/app/cashier-reports', role: ['cashier', 'owner', 'admin'] },
  { id: 'employees', label: 'Employee Management', icon: <PeopleIcon />, path: '/app/employees', role: ['owner', 'admin'] },
  { id: 'reports', label: 'Sales Reports', icon: <TrendingUpIcon />, path: '/app/report', role: ['owner', 'admin'] },
  { id: 'settings', label: 'System Settings', icon: <SettingsIcon />, path: '/app/settings', role: ['owner', 'admin'] },
];

export default function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const theme = useTheme();
  const navigate = useNavigate();
  const { role } = useRestaurantStore() as any;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredCommands = COMMANDS.filter((cmd) => {
    const matchesSearch = cmd.label.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !cmd.role || cmd.role.includes(role);
    return matchesSearch && matchesRole;
  });

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: theme.shadows[24],
          overflow: 'hidden',
          top: '-15%', // Move up slightly
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Search for a page or command... (⌘K)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="standard"
          autoComplete="off"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { fontSize: '1.2rem', py: 1 }
          }}
        />
      </Box>
      <DialogContent sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
        <List sx={{ py: 1 }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <ListItemButton
                key={cmd.id}
                onClick={() => handleSelect(cmd.path)}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(8px)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                  {cmd.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={cmd.label} 
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondary={cmd.path}
                />
                <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 700 }}>
                  Enter ↵
                </Typography>
              </ListItemButton>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: 'center', opacity: 0.5 }}>
              <Typography>No commands found matching "{search}"</Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.action.hover, 0.5), display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span" sx={{ px: 0.5, py: 0.2, bgcolor: 'divider', borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>↵</Box> to select
        </Typography>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box component="span" sx={{ px: 0.5, py: 0.2, bgcolor: 'divider', borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>esc</Box> to close
        </Typography>
      </Box>
    </Dialog>
  );
}
