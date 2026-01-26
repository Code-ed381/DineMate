import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import useAuthStore from "../../../lib/authStore";

interface InfoProps {
  totalPrice?: string;
}

const Info: React.FC<InfoProps> = () => {
  const { subscription, personalInfo, restaurantInfo } = useAuthStore();

  const address = `${restaurantInfo.address_line_1}, ${restaurantInfo.address_line_2 || ''}, ${restaurantInfo.city}, ${restaurantInfo.state}, ${restaurantInfo.zip_code}, ${restaurantInfo.country}`;

  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
        Owner
      </Typography>
      <Typography variant="h4" gutterBottom>
        {personalInfo.firstName.toUpperCase()} {personalInfo.lastName.toUpperCase()}
      </Typography>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Restaurant name"
            secondary={restaurantInfo.name.toUpperCase()}
          />
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Email"
            secondary={restaurantInfo.email}
          />
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Phone number"
            secondary={restaurantInfo.phone_number}
          />
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Address"
            secondary={address.toUpperCase()}
          />
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Subscription plan"
            secondary={subscription.subscription_plan.toUpperCase()}
          />
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Billing cycle"
            secondary={subscription.billing_cycle.toUpperCase()}
          />
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>
            $ {subscription.price}
          </Typography>
        </ListItem>
      </List>
    </React.Fragment>
  );
};

export default Info;
