import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Grid,
} from "@mui/material";
import useBarStore from "../lib/barStore";

const allOptions = [
  {
    id: "dine_in",
    title: "Dine In",
    description: "Customer eats at the restaurant.",
  },
  {
    id: "takeaway",
    title: "Takeaway",
    description: "Customer takes the order to go.",
  },
];

interface BigOptionButtonsProps {
  enableDineIn?: boolean;
  enableTakeaway?: boolean;
}

const BigOptionButtons: React.FC<BigOptionButtonsProps> = ({
  enableDineIn = true,
  enableTakeaway = true,
}) => {
  const { setBarOptionSelected, barOptionSelected } = useBarStore();

  const options = allOptions.filter((opt) => {
    if (opt.id === "dine_in" && !enableDineIn) return false;
    if (opt.id === "takeaway" && !enableTakeaway) return false;
    return true;
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBarOptionSelected(event.target.value);
  };

  return (
    <RadioGroup value={barOptionSelected} onChange={handleChange}>
      <Grid container spacing={2}>
        {options.map((opt) => (
          <Grid item xs={12} sm={6} key={opt.id}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: barOptionSelected === opt.id ? 4 : 1,
                borderColor: barOptionSelected === opt.id ? "primary.main" : "divider",
              }}
            >
              <CardActionArea
                onClick={() => setBarOptionSelected(opt.id)}
                sx={{ height: "100%" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {opt.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opt.description}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    value={opt.id}
                    control={<Radio />}
                    label=""
                    sx={{ m: 0 }}
                  />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </RadioGroup>
  );
};

export default BigOptionButtons;
