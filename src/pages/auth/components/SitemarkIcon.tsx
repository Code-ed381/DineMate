import * as React from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import { Box, Typography } from "@mui/material";
import Logo from "../../../assets/logo.png";

const SitemarkIcon: React.FC<SvgIconProps & any> = (props) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5} {...props}>
      <img src={Logo} alt="DineMate Logo" style={{ width: 40, height: 40 }} />
      <Typography variant="h5" fontWeight={800} color="primary">
        DineMate
      </Typography>
    </Box>
  );
};

export default SitemarkIcon;
