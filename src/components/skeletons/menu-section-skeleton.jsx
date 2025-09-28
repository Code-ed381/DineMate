import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  Stack,
} from "@mui/material";

export default function MenuSkeleton() {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Grid container spacing={2}>
        {/* LEFT SIDE: Menu */}
        <Grid item xs={12} md={8}>
          {/* Assigned Tables */}
          <Stack direction="row" spacing={2} mb={2}>
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>

          {/* Search bar */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={45}
            sx={{ borderRadius: 2, mb: 2 }}
          />

          {/* Categories */}
          <Stack direction="row" spacing={2} sx={{ overflowX: "auto", pb: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={100}
                height={35}
                sx={{ borderRadius: 20, flexShrink: 0 }}
              />
            ))}
          </Stack>

          {/* Menu Grid */}
          <Grid container spacing={2} mt={1}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea disabled>
                    <Skeleton
                      variant="rectangular"
                      height={140}
                      sx={{ borderRadius: "4px 4px 0 0" }}
                    />
                    <CardContent>
                      {/* Title + Price */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width={40} height={24} />
                      </Box>
                      {/* Description */}
                      <Skeleton variant="text" width="100%" height={18} />
                      <Skeleton variant="text" width="80%" height={18} />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* RIGHT SIDE: Receipt */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Stepper */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
            >
              <Skeleton variant="rectangular" width={150} height={30} />
              <Skeleton variant="rectangular" width={150} height={30} />
            </Box>

            <CardContent sx={{ flexGrow: 1 }}>
              {/* Order info */}
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>

              {/* Order table rows */}
              {[1, 2, 3, 4, 5].map((row) => (
                <Box
                  key={row}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="20%" height={20} />
                </Box>
              ))}

              {/* Totals */}
              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  mt: 2,
                  pt: 2,
                }}
              >
                {["Order Total", "Tax", "Discount", "Total"].map((label, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="text" width="20%" height={20} />
                  </Box>
                ))}
              </Box>
            </CardContent>

            {/* Checkout button */}
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rectangular" height={50} width="100%" />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
