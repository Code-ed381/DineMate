import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { SitemarkIcon } from "./CustomIcons";
import useAuthStore from "../../../lib/authStore";
import useRestaurantStore from "../../../lib/restaurantStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import Swal from "sweetalert2";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const ConfirmInvitationCard: React.FC = () => {
  const {
    user,
    validateConfirmPassword,
    password,
    passwordError,
    passwordErrorMessage,
    confirmPassword,
    confirmPasswordError,
    confirmPasswordErrorMessage,
    setConfirmPassword,
    setPassword,
    setProcessing,
    setAuth,
  } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [invitationData, setInvitationData] = React.useState<any>(null);

  React.useEffect(() => {
    const hash = window.location.hash;
    // Hash format: #confirm#access_token=...&refresh_token=...
    const hashParts = hash.split("#");
    const tokenParams = hashParts[2];

    const params = new URLSearchParams(tokenParams || "");
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
            Swal.fire("Error", "Invalid or expired invite link.", "error");
            navigate("/sign-in");
          } else if (data.user && data.session) {
            setAuth({ user: data.user, session: data.session });
            const meta = data.user.user_metadata || {};
            setInvitationData({
              firstName: meta.firstName || "",
              lastName: meta.lastName || "",
              phone: meta.phone || "",
              email: data.user.email || "",
              role: meta.role || "employee",
            });
          }
          setLoading(false);
        });
    } else {
      Swal.fire("Error", "Invalid invitation link.", "error");
      navigate("/sign-in");
    }
  }, [navigate, setAuth, setLoading]);

  const handleSubmit = async () => {
    try {
      setProcessing(true);
      setLoading(true);

      if (!validateConfirmPassword(password, confirmPassword)) {
        setProcessing(false);
        setLoading(false);
        return;
      }

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        Swal.fire("Error", updateError.message, "error");
        return;
      }

      // Update membership status to active via Edge Function (bypasses RLS)
      const { data: activateData, error: activateError } = await supabase.functions.invoke("admin-actions", {
        body: {
          action: "activate-member",
          userId: user?.id,
        }
      });

      if (activateError || !activateData?.success) {
        console.error("Edge Function activation failed:", activateError || activateData?.error);
        // Fallback: try direct update in case edge function not deployed yet
        const { error: statusUpdateError } = await supabase
          .from("restaurant_members")
          .update({ status: "active" })
          .eq("user_id", user?.id);
        if (statusUpdateError) {
          console.error("Fallback status update also failed:", statusUpdateError);
        }
      }

      // Get user's membership to determine role and redirect
      const { data: memberships } = await supabase
        .from("restaurant_members")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (memberships) {
        // Update restaurant store with correct role
        const { getRestaurants } = useRestaurantStore.getState();
        await getRestaurants();

        console.log("User role from database:", memberships.role);
        Swal.fire("Success", "Welcome to DineMate!", "success");

        // Redirect based on role
        switch (memberships.role) {
          case "owner":
          case "admin":
            navigate("/app/dashboard", { replace: true });
            break;
          case "waiter":
            navigate("/app/menu", { replace: true });
            break;
          case "chef":
            navigate("/app/kitchen", { replace: true });
            break;
          case "bartender":
            navigate("/app/bar", { replace: true });
            break;
          case "cashier":
            navigate("/app/cashier", { replace: true });
            break;
          default:
            navigate("/app/dashboard", { replace: true });
        }
      } else {
        Swal.fire("Error", "No restaurant membership found.", "error");
        navigate("/sign-in");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to complete setup.", "error");
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="outlined">
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Typography>Loading invitation...</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Confirm Your Invitation
      </Typography>

      {invitationData && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            You've been invited to join as{" "}
            <strong>{invitationData.role}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {invitationData.email}
          </Typography>
        </Box>
      )}

      <Box
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="password">Set Your Password</FormLabel>
          <TextField
            id="password"
            type="password"
            name="password"
            autoComplete="new-password"
            autoFocus
            required
            fullWidth
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            color={passwordError ? "error" : "primary"}
          />
          {passwordError && (
            <FormHelperText error>{passwordErrorMessage}</FormHelperText>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Password must be at least 8 characters with uppercase, lowercase,
            number, and special character.
          </Typography>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <TextField
            name="confirmPassword"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            required
            fullWidth
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            color={confirmPasswordError ? "error" : "primary"}
          />
          {confirmPasswordError && (
            <FormHelperText error>{confirmPasswordErrorMessage}</FormHelperText>
          )}
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Setting up..." : "Complete Setup"}
        </Button>
      </Box>
    </Card>
  );
};

export default ConfirmInvitationCard;
