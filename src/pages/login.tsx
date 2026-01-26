import React, { useEffect } from 'react';
import { Avatar, Button, CssBaseline, Box, Grid, Typography, Stack, Container, TextField } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useAuthStore from '../lib/authStore';
import image from '../assets/image5.jpeg';

const theme = createTheme();

const Copyright: React.FC<any> = (props) => {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <a href="https://cyaneltechnologies.com/">Powered by Addai Johnson Exploration Technologies - AJxT</a>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
};

export default function SignInSide() {
    const {
        password,
        employees,
        selectedEmployee,
        setPassword,
        setSelectedEmployee,
        fetchEmployees,
        login,
    } = useAuthStore();

    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      await login(navigate);
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ width: 500, marginTop: 20 }}>
                            {employees.map((employee: any) => (
                                <Button
                                    key={employee.id}
                                    variant="contained"
                                    color="secondary"
                                    sx={{ margin: 2 }}
                                    onClick={() => setSelectedEmployee(employee)}
                                >
                                    <Stack spacing={1}>
                                        <Avatar alt={employee.name} src={employee.image} sx={{ width: 100, height: 100, border: 'solid 5px' }} />
                                        <Typography>{employee.name}</Typography>
                                    </Stack>
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={8} md={5} elevation={6} square>
                    <Container maxWidth="xs">
                        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>
                            <Typography component="h1" variant="h5">Sign in</Typography>
                            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                <Stack alignItems="center">
                                    {selectedEmployee ? (
                                        <Button disabled sx={{ margin: 2 }}>
                                            <Stack spacing={1} alignItems="center">
                                                <Avatar alt={selectedEmployee.name} src={selectedEmployee.image} sx={{ width: 100, height: 100, border: 'solid 5px' }} />
                                                <Typography>{selectedEmployee.name}</Typography>
                                            </Stack>
                                        </Button>
                                    ) : (
                                        <Button disabled sx={{ margin: 2 }}>
                                            <Stack spacing={1} alignItems="center">
                                                <Avatar alt="Select User" sx={{ width: 100, height: 100, border: 'solid 5px' }} />
                                                <Typography>Select User</Typography>
                                            </Stack>
                                        </Button>
                                    )}
                                </Stack>
                                {selectedEmployee && (
                                    <>
                                        <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign In</Button>
                                    </>
                                )}
                                <Copyright sx={{ mt: 5 }} />
                            </Box>
                        </Box>
                    </Container>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
