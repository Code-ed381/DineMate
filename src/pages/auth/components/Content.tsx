import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SpeedIcon from "@mui/icons-material/Speed";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Logo from "../../../assets/logo.png";

const items = [
  {
    icon: <SpeedIcon sx={{ color: "text.secondary" }} />,
    title: "Seamless Restaurant Operations",
    description:
      "Our platform effortlessly adapts to your restaurant's unique workflow, boosting staff efficiency and simplifying daily management tasks.",
  },
  {
    icon: <RestaurantIcon sx={{ color: "text.secondary" }} />,
    title: "Built for Restaurant Demands",
    description:
      "Experience unmatched reliability designed for the fast-paced restaurant environment, ensuring smooth operations during peak hours.",
  },
  {
    icon: <PeopleIcon sx={{ color: "text.secondary" }} />,
    title: "Intuitive Staff Experience",
    description:
      "Integrate DineMate into your team's routine with an easy-to-use interface that requires minimal training and maximizes productivity.",
  },
  {
    icon: <TrendingUpIcon sx={{ color: "text.secondary" }} />,
    title: "Smart Restaurant Features",
    description:
      "Stay ahead with innovative tools that set new industry standards, addressing evolving restaurant needs better than traditional POS systems.",
  },
];

const Content: React.FC = () => {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 4,
        maxWidth: 450,
      }}
    >
      <Box sx={{ display: { xs: "none", md: "flex", alignItems: "center" } }}>
        <img src={Logo} alt="Logo" width={80} height={80} />
        <Typography variant="h5" sx={{ fontWeight: "bold", ml: 2 }}>
          DineMate
        </Typography>
      </Box>
      {items.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2 }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: "medium" }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
};

export default Content;
