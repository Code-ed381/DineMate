import React, { useState } from "react";
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

const options = [
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

export default function BigOptionButtons() {
  const { setBarOptionSelected, barOptionSelected } = useBarStore();

  const handleChange = (event) => {
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
                borderColor: barOptionSelected === opt.id ? "primary.main" : "grey.300",
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
                  {/* Left Side: Title + Description */}
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {opt.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opt.description}
                    </Typography>
                  </Box>

                  {/* Right Side: Radio */}
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
}
