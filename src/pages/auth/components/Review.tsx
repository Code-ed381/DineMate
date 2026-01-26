import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import useAuthStore from "../../../lib/authStore";

const Review: React.FC = () => {
  const { consent, updateConsent, validationErrors } = useAuthStore();
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  return (
    <Box mt={4}>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography component="span" sx={{ width: "50%", flexShrink: 0 }}>
            USER AGREEMENT (TERMS OF SERVICE)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6">
            Welcome to DineMate (the “App”). By accessing or using our services,
            you agree to these Terms of Service. Please read them carefully.
          </Typography>
          <hr />
          <Typography variant="subtitle1">1. Eligibility</Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                You must be at least 18 years old or have permission from a
                parent/guardian to use the App.
              </li>
              <li>
                You must provide accurate personal and restaurant information
                during registration.
              </li>
            </ul>
          </Typography>

          <Typography variant="subtitle1">
            2. Account Responsibilities
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                You agree not to share your account or impersonate another user.
              </li>
              <li>
                You are responsible for all activity that occurs under your
                account.
              </li>
            </ul>
          </Typography>

          <Typography variant="subtitle1">3. Use of the App</Typography>
          <Typography variant="body2">
            You agree to use the App only for lawful purposes related to
            restaurant management, including but not limited to:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Managing tables, menus, and employees.</li>
              <li>Viewing reports and analytics.</li>
              <li>Communicating with staff.</li>
            </ul>
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            You may not:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Use the App for fraudulent activities.</li>
              <li>Upload harmful or malicious content.</li>
              <li>
                Use the App to access or modify data that does not belong to
                you.
              </li>
              <li>Reverse engineer or attempt to hack the App.</li>
            </ul>
          </Typography>
          <Typography variant="subtitle1">
            4. Payments & Subscriptions
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }} component="div">
            <ul>
              <li>
                Some features require a paid subscription (e.g., Pro plan).
              </li>
              <li>
                Subscription fees are billed on a recurring basis unless
                canceled.
              </li>
              <li>
                You may cancel anytime, but fees already paid are
                non-refundable.
              </li>
            </ul>
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            5. Termination
          </Typography>
          <Typography variant="body2">
            We may suspend or terminate accounts that violate these terms
            without prior notice.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            6. Limitation of Liability
          </Typography>
          <Typography variant="body2">
            We are not liable for any damages arising from your use of the App.
            The App is provided “as is.” We are not liable for lost profits,
            data loss, or indirect damages.
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            7. Changes to Terms
          </Typography>
          <Typography variant="body2">
            We may update these terms from time to time. Continued use of the
            App means you accept the revised terms.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography component="span" sx={{ width: "50%", flexShrink: 0 }}>
            PRIVACY POLICY
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6">
            DineMate values your privacy. This policy explains how we collect,
            use, and protect your information.
          </Typography>
          <hr />
          <Typography variant="subtitle1">1. Information We Collect</Typography>
          <Typography variant="body2" component="div">
            We collect information you provide directly, such as:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                Personal information (name, email, phone number, profile
                picture.)
              </li>
              <li>
                Restaurant details (business name, address, contact details,
                table and menu data)
              </li>
              <li>Menu items and prices</li>
              <li>Order history and preferences</li>
              <li>Payment information (for subscriptions)</li>
              <li>Device info, app activity, login times.</li>
            </ul>
          </Typography>
          <Typography variant="subtitle1">
            2. How We Use Your Information
          </Typography>
          <Typography variant="body2" component="div">We use your information to:</Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Provide and improve our services</li>
              <li>Send you updates and notifications</li>
              <li>Process payments and orders</li>
              <li>Improve our products and services</li>
            </ul>
          </Typography>
          <Typography variant="subtitle1">3. Sharing of Information</Typography>
          <Typography variant="body2" component="div">
            We do not sell your personal data. We may share information only
            with:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Service providers for app functionality</li>
              <li>Payment processors for transactions</li>
              <li>Legal authorities as required by law</li>
            </ul>
          </Typography>
          <Typography variant="subtitle1">
            4. Data Storage & Security
          </Typography>
          <Typography variant="body2" component="div">
            We implement security measures to protect your information from
            unauthorized access, disclosure, and loss.
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                Your data is securely stored using industry best practices
                (e.g., encryption, access controls).
              </li>
              <li>
                We take reasonable measures to protect against unauthorized
                access, but no system is 100% secure.
              </li>
            </ul>
          </Typography>
          <Typography variant="subtitle1">5. Data Retention</Typography>
          <Typography variant="body2">
            We retain your information as long as you have an account. You can
            request deletion of your account and data at any time.
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            6. Your Rights
          </Typography>
          <Typography variant="body2" component="div">You have the right to:</Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>Access, correct, or delete your personal data.</li>
              <li>Opt-out of marketing emails.</li>
              <li>Contact us to exercise privacy rights.</li>
            </ul>
          </Typography>
          <Typography variant="subtitle1">7. Changes to This Policy</Typography>
          <Typography variant="body2">
            We may update this policy from time to time. Continued use of the
            App means you accept the revised policy.
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            8. Contact Us
          </Typography>
          <Typography variant="body2">
            If you have questions or concerns, please contact us at
            <a href="mailto:support@dineMate.com"> support@dineMate.com</a>.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Typography variant="subtitle1" sx={{ mt: 4 }}>
        <Checkbox onChange={(e) => updateConsent(e.target.checked)} checked={consent}/>
        By creating an account, I agree to the Terms of Service and Privacy
        Policy.
      </Typography>
      {Object.keys(validationErrors).length > 0 && (
        <Typography variant="body2" color="error">
          {Object.values(validationErrors).join(", ")}
        </Typography>
      )}
    </Box>
  );
};

export default Review;
