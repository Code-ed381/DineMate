import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Chip,
  Box,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  target?: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "error" | "warning" | "success" | "info";
  inverseGood?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  target,
  subtitle,
  icon,
  color,
  inverseGood,
}) => {
  const theme = useTheme();
  const isPositive = inverseGood ? (change || 0) < 0 : (change || 0) > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;
  const targetProgress = target ? (numericValue / target) * 100 : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Avatar
            sx={{
              bgcolor: alpha((theme.palette as any)[color].main, 0.1),
              color: `${color}.main`,
            }}
          >
            {icon}
          </Avatar>
          {change !== undefined && (
            <Chip
              icon={<TrendIcon />}
              label={`${Math.abs(change).toFixed(1)}%`}
              size="small"
              color={isPositive ? "success" : "error"}
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {target && (
          <Box mt={2}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Target Progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {targetProgress.toFixed(0)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, targetProgress)}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
