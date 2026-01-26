import { Components, Theme } from "@mui/material/styles";

const components: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        fontWeight: "bold",
        fontSize: "1rem",
        height: "3rem",
        textTransform: "none",
        boxShadow: "none",
        '&:hover': {
          boxShadow: "0px 2px 8px hsla(0, 0%, 0%, 0.05)",
        }
      },
    },
    defaultProps: { 
      disableRipple: true,
    },
  }
};

export default components;
