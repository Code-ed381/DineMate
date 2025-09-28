import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Avatar,
  Box,
  Skeleton,
} from "@mui/material";
import { HourglassTop, LocalBar, History } from "@mui/icons-material";

export default function BarDineInPanelSkeleton() {
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      {/* Active Orders Skeleton */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #ffa726",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#ef6c00",
              }}
            >
              <HourglassTop /> Active Drink Orders
            </Typography>
            <List>
              {Array.from({ length: 3 }).map((_, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    mb: 1.5,
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 64,
                      height: 64,
                      mr: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Skeleton variant="rectangular" width={64} height={64} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="40%" height={14} sx={{ mt: 1 }} />
                  </Box>
                  <Skeleton width={60} height={16} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Ready for Pickup Skeleton */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #42a5f5",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#1565c0",
              }}
            >
              <LocalBar /> Ready for Pickup
            </Typography>
            <List>
              {Array.from({ length: 3 }).map((_, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    mb: 1.5,
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 64,
                      height: 64,
                      mr: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Skeleton variant="rectangular" width={64} height={64} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="40%" height={14} sx={{ mt: 1 }} />
                  </Box>
                  <Skeleton width={70} height={16} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Completed Orders Skeleton */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid #66bb6a",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "#2e7d32",
              }}
            >
              <History /> Recent Completed Orders
            </Typography>
            <List>
              {Array.from({ length: 3 }).map((_, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    mb: 1.5,
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 64,
                      height: 64,
                      mr: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Skeleton variant="rectangular" width={64} height={64} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
                    <Skeleton width="80%" height={16} />
                    <Skeleton width="40%" height={14} sx={{ mt: 1 }} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
