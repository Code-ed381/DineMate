import React from "react";
import { Box } from "@mui/material";
import GlassmorphismNavbar from "../components/landing/GlassmorphismNavbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesGrid from "../components/landing/FeaturesGrid";
import HowItWorks from "../components/landing/HowItWorks";
import PricingSection from "../components/landing/PricingSection";
import SimpleFooter from "../components/landing/SimpleFooter";
import { SubscriptionProvider } from "../providers/subscriptionProvider";

const IndexPage: React.FC = () => {
  return (
    <SubscriptionProvider>
      <Box
        sx={{
          minHeight: "100vh",
        }}
      >
        {/* Navigation */}
        <GlassmorphismNavbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Features Grid */}
        <FeaturesGrid />

        {/* How It Works */}
        <HowItWorks />

        {/* Pricing */}
        <PricingSection />

        {/* Footer */}
        <SimpleFooter />
      </Box>
    </SubscriptionProvider>
  );
};

export default IndexPage;
