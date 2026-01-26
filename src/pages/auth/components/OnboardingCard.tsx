import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { SitemarkIcon } from './CustomIcons';
import { useState, useEffect } from 'react';
import useAuthStore from '../../../lib/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const OnboardingCard: React.FC = () => {
  const {
    validateConfirmPassword,
    setLoading,
    setAuth,
    password,
    passwordError,
    passwordErrorMessage,
    confirmPassword,
    confirmPasswordError,
    confirmPasswordErrorMessage,
    setConfirmPassword,
    setPassword,
    setProcessing,
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.href.split("#")[2]; // take the second hash part
    const params = new URLSearchParams(hash || "");

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({
          access_token,
          refresh_token,
        })
        .then(async ({ data, error }) => {
          if (error) {
            console.error("Error setting session:", error);
          } else {
            if (data.user && data.session) {
                setAuth({ user: data.user, session: data.session });
            }
          }
          setLoading(false);
        });
    } else {
      navigate("/login");
    }
  }, [navigate, setAuth, setLoading]);


  const handleSubmit = async () => {
    try {
      setProcessing(true);

      if (!validateConfirmPassword(password, confirmPassword)) return;

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error(error);
        return;
      }

      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
      >
        Set Password
      </Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <TextField
            id="password"
            type="password"
            name="password"
            autoComplete="password"
            autoFocus
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
          {passwordError && (
            <FormHelperText error>
              {passwordErrorMessage}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          </Box>
          <TextField
            name="confirmPassword"
            type="password"
            id="confirmPassword"
            autoComplete="confirm-password"
            required
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            color={confirmPasswordError ? 'error' : 'primary'}
          />
          {confirmPasswordError && (
            <FormHelperText error>
              {confirmPasswordErrorMessage}
            </FormHelperText>
          )}
        </FormControl>
        <Button type="submit" fullWidth variant="contained" onClick={handleSubmit}>
          Set Password
        </Button>
      </Box>
    </Card>
  );
};

export default OnboardingCard;
