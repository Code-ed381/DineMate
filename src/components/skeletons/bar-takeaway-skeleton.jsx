import {
  Box,
  Grid,
  Paper,
  Button,
  Stack,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
} from "@mui/material";

export default function BarTakeAwaySkeleton() {
  return (
    <Box sx={{ mt: 5 }}>
      <Grid container spacing={3}>
        {/* Menu Grid */}
        <Grid item xs={12} md={6}>
          {/* Category buttons + Search bar */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={9}>
              <Stack direction="row" spacing={1}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    variant="rounded"
                    width={80}
                    height={36}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Skeleton variant="rounded" width="100%" height={40} />
            </Grid>
          </Grid>

          {/* Drinks grid */}
          <Grid container spacing={2}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    height: 180,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Skeleton variant="rectangular" height={100} />
                  <Skeleton
                    variant="text"
                    width="80%"
                    sx={{ mt: 1, fontSize: "1rem" }}
                  />
                  <Skeleton
                    variant="text"
                    width="50%"
                    sx={{ fontSize: "0.8rem" }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Customer Tabs */}
        <Grid item xs={12} md={2}>
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={36}
              sx={{ mb: 2 }}
            />
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={0}
              sx={{ mb: 2 }}
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <Tab
                  key={idx}
                  label={<Skeleton variant="text" width={80} />}
                  disabled
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>

        {/* Receipt Table */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton
              variant="text"
              width={120}
              sx={{ fontSize: "1.2rem", mb: 2 }}
            />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Skeleton width={40} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={30} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={20} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={50} />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton width={60} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={30} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={20} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={40} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={20} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
                gap: 2,
              }}
            >
              <Skeleton variant="rounded" width={80} height={36} />
              <Skeleton variant="rounded" width={120} height={36} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
