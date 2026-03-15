import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface MiniChartProps {
  type: "pie" | "bar" | "progress" | "simple";
  data: any[];
  colors?: string[];
  height?: number;
  title?: string;
  subtitle?: string;
}

const MiniChart: React.FC<MiniChartProps> = ({
  type,
  data,
  colors,
  height = 120,
  title,
  subtitle,
}) => {
  const theme = useTheme();
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const chartColors = colors || defaultColors;

  if (type === "pie" && data.length > 0) {
    return (
      <Box sx={{ height, width: "100%", position: "relative" }}>
        {title && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={height - 20}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.15}
              outerRadius={height * 0.35}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [value, "Count"]}
              contentStyle={{
                fontSize: "0.75rem",
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block", textAlign: "center" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    );
  }

  if (type === "bar" && data.length > 0) {
    return (
      <Box sx={{ height, width: "100%" }}>
        {title && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={height - 20}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: any) => [value, "Count"]}
              contentStyle={{
                fontSize: "0.75rem",
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Bar dataKey="value" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block", textAlign: "center" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    );
  }

  if (type === "progress" && data.length > 0) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return (
      <Box sx={{ width: "100%" }}>
        {title && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            {title}
          </Typography>
        )}
        {data.map((item, index) => (
          <Box key={item.label} sx={{ mb: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {item.value} (
                {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={total > 0 ? (item.value / total) * 100 : 0}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.divider, 0.3),
                "& .MuiLinearProgress-bar": {
                  backgroundColor: chartColors[index % chartColors.length],
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        ))}
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    );
  }

  if (type === "simple" && data.length > 0) {
    return (
      <Box sx={{ width: "100%" }}>
        {title && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            {title}
          </Typography>
        )}
        {data.map((item, index) => (
          <Box
            key={item.label}
            sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Chip
              label={item.value}
              size="small"
              sx={{
                backgroundColor: alpha(
                  chartColors[index % chartColors.length],
                  0.1,
                ),
                color: chartColors[index % chartColors.length],
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        ))}
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        No data available
      </Typography>
    </Box>
  );
};

export default MiniChart;
