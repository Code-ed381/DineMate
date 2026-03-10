import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  IconButton,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { Facebook, Twitter, Linkedin, Instagram, Mail } from "lucide-react";
import Logo from "../../assets/logo.png";

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Integrations", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Contact", href: "#contact" },
    { name: "Status", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

const SimpleFooter: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      id="contact"
      component="footer"
      sx={{
        py: 6,
        background: theme.palette.mode === "dark" ? "#0a0a0f" : "#f8f9fa",
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <img src={Logo} alt="DineMate" width={32} height={32} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #60a5fa 55%, #22d3ee 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                DineMate
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Restaurant management made simple for Ghanaian businesses.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  size="small"
                  sx={{
                    color: "text.secondary",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  <social.icon size={18} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
            >
              Product
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {footerLinks.product.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
            >
              Company
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
            >
              Support
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {footerLinks.support.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "primary.main",
                    },
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
            >
              Contact
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={14} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  hello@dinemate.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom */}
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            © 2026 DineMate. Built in Ghana 🇬🇭
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SimpleFooter;
