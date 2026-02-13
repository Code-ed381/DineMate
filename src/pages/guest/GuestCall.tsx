import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress,
  Fade,
  Stack,
  IconButton
} from '@mui/material';
import { 
  NotificationsActive as CallIcon,
  CheckCircle as SuccessIcon,
  Restaurant as RestaurantIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notificationService';
import { motion } from 'framer-motion';

const GuestCall: React.FC = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restaurantName, setRestaurantName] = useState('DineMate');
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!restaurantId || !tableId) return;
      
      try {
        const [resResult, tableResult] = await Promise.all([
          supabase.from('restaurants').select('name').eq('id', restaurantId).single(),
          supabase.from('restaurant_tables').select('table_number').eq('id', tableId).single()
        ]);

        if (resResult.data) setRestaurantName(resResult.data.name);
        if (tableResult.data) setTableNumber(tableResult.data.table_number.toString());
      } catch (err) {
        console.error('Error fetching details:', err);
      }
    };

    fetchDetails();
  }, [restaurantId, tableId]);

  const handleCallWaiter = async () => {
    if (!restaurantId || !tableId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Insert service request
      const { error: insertError } = await supabase
        .from('service_requests')
        .insert({
          restaurant_id: restaurantId,
          table_id: tableId,
          table_number: tableNumber,
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Note: The notification to waiters is handled by a Database Trigger on 'service_requests'.
      // This ensures secure notification creation even for unauthenticated users.

      setSuccess(true);
    } catch (err: any) {
      console.error('Error calling waiter:', err);
      setError('Failed to call waiter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={24}
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          >
            <Box sx={{ mb: 4 }}>
              <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="900" gutterBottom>
                {restaurantName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.7 }}>
                Table {tableNumber}
              </Typography>
            </Box>

            {!success ? (
              <Stack spacing={3}>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Need assistance? Press the button below to notify your waiter.
                </Typography>
                
                <Box sx={{ position: 'relative' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleCallWaiter}
                    disabled={loading}
                    sx={{ 
                      py: 3, 
                      borderRadius: 3,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
                      }
                    }}
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CallIcon />}
                  >
                    {loading ? 'Notifying...' : 'Call Waiter'}
                  </Button>
                </Box>
                
                {error && (
                  <Typography variant="caption" color="error">
                    {error}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Fade in={success}>
                <Box sx={{ py: 2 }}>
                  <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Waiter Notified!
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8, mb: 4 }}>
                    Someone will be with you shortly. Thank you for your patience.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    onClick={() => setSuccess(false)}
                    sx={{ borderRadius: 2 }}
                    startIcon={<BackIcon />}
                  >
                    Back
                  </Button>
                </Box>
              </Fade>
            )}
          </Paper>
        </motion.div>
        
        <Typography variant="caption" sx={{ mt: 4, display: 'block', textAlign: 'center', opacity: 0.4 }}>
          Powered by DineMate
        </Typography>
      </Container>
    </Box>
  );
};

export default GuestCall;
