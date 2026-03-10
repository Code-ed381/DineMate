import * as React from 'react';
import { Fragment } from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Info from './components/Info';
import InfoMobile from './components/InfoMobile';
import Logo from '../../assets/logo.png';
import CircularProgress from "@mui/material/CircularProgress";
import AppTheme from "./components/shared-theme/AppTheme";
import ColorModeIconToggle from './components/shared-theme/ColorModeIconToggle';
import useAuthStore from '../../lib/authStore';
import useAppStore from '../../lib/appstore';
import AuthStepperContent from './components/AuthStepperContent';
import Swal from 'sweetalert2';
import { usePaystackPayment } from 'react-paystack';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../lib/supabase";
import { plans } from "../../config/plans";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const Checkout: React.FC = (props) => {
  const {
    steps,
    activeStep,
    handleBack,
    handleNextWithValidation,
    personalInfo,
    restaurantInfo,
    subscription,
    setProcessing,
    processing,
    paymentComplete,
    setPaymentComplete,
    paymentError,
    setPaymentError,
    handleNext,
  } = useAuthStore();

  const navigate = useNavigate();
  const [signupError, setSignupError] = React.useState<string | null>(null);

  const config = React.useMemo(() => ({
    reference: (new Date()).getTime().toString(),
    email: personalInfo.email,
    amount: (subscription.price || 0) * 100,
    currency: "GHS",
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  }), [personalInfo.email, subscription.price]);

  const initializePayment = usePaystackPayment(config);

  const onNext = async () => {
    const result = handleNextWithValidation();
    if (!result.success) {
      return;
    }

    if (activeStep === steps.length - 1) {
      // 1. Create the account first while staying on the current step
      const signupResult = await onSubmit();
      if (!signupResult) return; // onSubmit handles its own errors and Swal alerts

      // Initialize session so we can verify the payment securely
      await supabase.auth.signInWithPassword({
        email: personalInfo.email,
        password: personalInfo.password || ""
      });

      // 2. Account created successfully. If it's a paid plan, handle payment.
      if (subscription.subscription_plan !== 'free') {
        if (!config.publicKey) {
          Swal.fire("Configuration Error", "Paystack public key is not set", "error");
          // User is still on the step, they can potentially fix it or we can't do much here
          return;
        }

        const handlePayment = () => {
          initializePayment({
            onSuccess: async (referenceData: any) => {
              setProcessing(true);
              try {
                const { error } = await supabase.functions.invoke('verify-payment', {
                  body: {
                    reference: referenceData.reference,
                    planId: subscription.subscription_plan,
                    billingCycle: subscription.billing_cycle,
                    restaurantId: signupResult.restaurantId,
                    userId: signupResult.userId
                  }
                });
                if (!error) {
                  setPaymentComplete(true);
                  handleNext(); // SUCCESS: Now move to Welcome screen
                } else {
                  throw error;
                }
              } catch (err) {
                console.error("Payment verification failed", err);
                setPaymentError("Could not verify your payment. Please contact support.");
                handlePaymentFailure();
              } finally {
                setProcessing(false);
              }
            },
            onClose: () => {
              handlePaymentFailure();
            }
          });
        };

        const handlePaymentFailure = () => {
          Swal.fire({
            title: "Payment Not Completed",
            text: "Your account is created, but payment was not finished. Would you like to try again or explore our free plan?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Try Payment Again",
            cancelButtonText: "Explore Free Plan",
            reverseButtons: true,
          }).then((result) => {
            if (result.isConfirmed) {
              handlePayment();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // Switch to free plan
              useAuthStore.setState((state) => ({
                subscription: {
                  ...state.defaultSubscription,
                  subscription_plan: 'free',
                  price: 0
                }
              }));
              handleNext(); // Proceed to Welcome screen
            }
          });
        };

        handlePayment();
      } else {
        // Free plan, proceed directly to Welcome screen
        handleNext(); 
      }
    }
  };

  const onSubmit = async () => {
    setProcessing(true);
    setPaymentError(null);
    setSignupError(null); 
    try {
      const { tempFiles } = useAuthStore.getState();

      const payload = {
        personalInfo,
        restaurantInfo,
        subscription: {
          ...subscription,
          limits: plans.find(p => p.id === subscription.subscription_plan)?.limits || plans[0].limits
        },
        files: {
          avatar: tempFiles.avatar ? await fileToBase64(tempFiles.avatar) : null,
          idDocument: tempFiles.idDocument ? await fileToBase64(tempFiles.idDocument) : null,
          logo: tempFiles.logo ? await fileToBase64(tempFiles.logo) : null,
          businessCertificate: tempFiles.businessCertificate ? await fileToBase64(tempFiles.businessCertificate) : null
        }
      };

      const { data, error } = await supabase.functions.invoke('signup', {
        body: payload,
      });

      if (error) {
        throw new Error(error.message || "Signup failed");
      }

      return { userId: data.user.id, restaurantId: data.restaurant.id };
    } catch (error: any) {
      console.error("Signup error:", error);
      setSignupError(error.message);
      
      Swal.fire({
        title: "Account Creation Failed",
        text: error.message || "We encountered an error while creating your account.",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Try Again",
        cancelButtonText: "Start Over",
        reverseButtons: true,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
          useAuthStore.getState().clearRegistrationData();
          window.location.reload();
        }
      });
      
      return null;
    } finally {
      setProcessing(false);
    }
  };


  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: "fixed", top: "1rem", right: "1rem" }}>
        <ColorModeIconToggle />
      </Box>

      <Grid
        container
        sx={{
          height: {
            xs: "100%",
            sm: "calc(100dvh - var(--template-frame-height, 0px))",
          },
          mt: {
            xs: 4,
            sm: 0,
          },
        }}
      >
        <Grid
          item
          xs={12}
          sm={5}
          lg={4}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            backgroundColor: "background.paper",
            borderRight: { sm: "none", md: "1px solid" },
            borderColor: { sm: "none", md: "divider" },
            alignItems: "start",
            pt: 16,
            px: 10,
            gap: 4,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <img src={Logo} alt="DineMate Logo" style={{ width: 40, height: 40 }} />
            <Typography variant="h5" fontWeight={800} color="primary">
              DineMate
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              height: "100%",
              width: "100%",
              maxWidth: 600,
            }}
          >
            <Info totalPrice={`$${subscription?.price || 0}`} />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sm={7}
          lg={8}
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            width: "100%",
            backgroundColor: { xs: "transparent", sm: "background.default" },
            alignItems: "start",
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: { sm: "space-between", md: "flex-end" },
              alignItems: "center",
              width: "100%",
              maxWidth: { sm: "100%", md: "100%" },
            }}
          >
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexGrow: 1,
              }}
            >
              <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{ width: "100%", height: 40 }}
              >
                {steps.map((label) => (
                  <Step
                    sx={{ ":first-child": { pl: 0 }, ":last-child": { pr: 0 } }}
                    key={label}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
          <Card sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Selected products
                </Typography>
                <Typography variant="body1">
                  ${subscription?.price || 0}
                </Typography>
              </div>
              <InfoMobile
                totalPrice={`$${subscription?.price || 0}`}
              />
            </CardContent>
          </Card>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              maxWidth: { sm: "100%", md: "100%" },
              minHeight: "790px",
              gap: { xs: 5, md: "none" },
            }}
          >
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: "flex", md: "none" } }}
            >
              {steps.map((label) => (
                <Step
                  sx={{
                    ":first-child": { pl: 0 },
                    ":last-child": { pr: 0 },
                    "& .MuiStepConnector-root": { top: { xs: 6, sm: 12 } },
                  }}
                  key={label}
                >
                  <StepLabel
                    sx={{
                      ".MuiStepLabel-labelContainer": { maxWidth: "70px" },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {(() => {
              const { clearRegistrationData, steps, activeStep: currentActiveStep } = useAuthStore.getState();
              
              // If user is on the success/error screen when mounting (e.g. they closed the tab),
              // we should clear data so they aren't stuck on a stale screen if they return.
              React.useEffect(() => {
                const state = useAuthStore.getState();
                if (state.activeStep >= state.steps.length) {
                  state.clearRegistrationData();
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, []);

              if (activeStep === steps.length) {
                return (
                  <Stack spacing={2} useFlexGap sx={{ alignItems: "center", textAlign: "center", py: 4 }}>
                    <Typography variant="h1">
                      {signupError ? "❌" : paymentError ? "⌛" : "🎉"}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {signupError
                        ? "Signup Failed"
                        : paymentError
                        ? "Account Ready!"
                        : "Welcome to DineMate!"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 480 }}>
                      {signupError ? (
                        <Box sx={{ color: "error.main" }}>
                          We encountered an error while creating your account: {signupError}
                        </Box>
                      ) : subscription.subscription_plan === "free" || paymentComplete ? (
                        <>
                          Your account has been created successfully. We've sent a
                          confirmation email to <strong>{personalInfo.email}</strong>.
                          Please check your personal email and confirm your account creation to get started.
                        </>
                      ) : (
                        <>
                          Your account has been created, but your payment is still pending. 
                          Once you complete your payment, your restaurant plan will be activated. 
                          {paymentError && <Box sx={{ color: 'error.main', mt: 1 }}>{paymentError}</Box>}
                        </>
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      {signupError ? (
                        <Button
                          variant="contained"
                          onClick={() => {
                            clearRegistrationData();
                            window.location.reload();
                          }}
                          sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                          Try Again
                        </Button>
                      ) : (
                        <>
                          {!paymentComplete && subscription.subscription_plan !== "free" && (
                            <Button
                              variant="contained"
                              onClick={() => {
                                clearRegistrationData();
                                window.location.reload();
                              }}
                              sx={{ width: { xs: "100%", sm: "auto" } }}
                            >
                              Try Payment Again
                            </Button>
                          )}
                          <Button
                            variant={paymentComplete || subscription.subscription_plan === "free" ? "contained" : "outlined"}
                            onClick={() => {
                              clearRegistrationData();
                              navigate("/sign-in");
                            }}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                          >
                            Go to Sign In
                          </Button>
                        </>
                      )}
                    </Box>
                  </Stack>
                );
              }

              return (
                <Fragment>
                  <AuthStepperContent step={activeStep} />
                  {signupError && activeStep === steps.length - 1 && (
                    <Typography color="error" variant="body2" sx={{ textAlign: "right", mt: 2, fontWeight: 500 }}>
                      {signupError}
                    </Typography>
                  )}
                  <Box
                    sx={[
                      {
                        display: "flex",
                        flexDirection: { xs: "column-reverse", sm: "row" },
                        alignItems: "end",
                        flexGrow: 1,
                        gap: 1,
                        pb: { xs: 12, sm: 0 },
                        mt: { xs: 2, sm: 0 },
                        mb: "60px",
                      },
                      activeStep !== 0
                        ? { justifyContent: "space-between" }
                        : { justifyContent: "flex-end" },
                    ]}
                  >
                    {activeStep !== 0 && (
                      <Button
                        startIcon={<ChevronLeftRoundedIcon />}
                        onClick={handleBack}
                        variant="text"
                        sx={{ display: { xs: "none", sm: "flex" } }}
                      >
                        Previous
                      </Button>
                    )}
                    {activeStep !== 0 && (
                      <Button
                        startIcon={<ChevronLeftRoundedIcon />}
                        onClick={handleBack}
                        variant="outlined"
                        fullWidth
                        sx={{ display: { xs: "flex", sm: "none" } }}
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      endIcon={processing ? <CircularProgress size={20} color="inherit" /> : <ChevronRightRoundedIcon />}
                      onClick={onNext}
                      disabled={processing}
                      sx={{ width: { xs: "100%", sm: "fit-content" } }}
                    >
                      {activeStep === steps.length - 1 ? (processing ? "Creating..." : "Create account") : "Next"}
                    </Button>
                  </Box>
                </Fragment>
              );
            })()}
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
};

export default Checkout;
