import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  Group,
  RestaurantMenu,
  Settings,
  Assignment,
  Notifications,
  CheckCircle,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import DashboardHeader from "../../components/dashboard-header";

// Dummy Data
const salesData = [
  { day: "Mon", dineIn: 300, takeOut: 150 },
  { day: "Tue", dineIn: 500, takeOut: 200 },
  { day: "Wed", dineIn: 450, takeOut: 220 },
  { day: "Thu", dineIn: 600, takeOut: 250 },
  { day: "Fri", dineIn: 900, takeOut: 300 },
  { day: "Sat", dineIn: 1300, takeOut: 500 },
  { day: "Sun", dineIn: 1000, takeOut: 400 },
];

const topMenuData = [
  { name: "Burgers", value: 400 },
  { name: "Pizza", value: 300 },
  { name: "Pasta", value: 200 },
  { name: "Salads", value: 150 },
];

const staffPerformance = [
  { name: "Alice", sales: 1200 },
  { name: "Bob", sales: 950 },
  { name: "Clara", sales: 800 },
  { name: "Daniel", sales: 700 },
];

const COLORS = ["#1976d2", "#ff9800", "#4caf50", "#f44336"];

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>
      {/* Header Section */}
      <DashboardHeader
        title="Admin Dashboard"
        description="Here’s a quick summary of your restaurant’s performance today."
        background="linear-gradient(135deg, rgba(25,118,210,1) 0%, rgba(0,200,150,1) 100%)"
        color="#fff"
      />

      {/* KPI Cards */}
      <Grid container spacing={3}>
        {[
          {
            title: "Total Revenue",
            value: "$12,350",
            icon: <TrendingUp />,
            color: "#1976d2",
          },
          {
            title: "Orders Today",
            value: "235",
            icon: <ShoppingCart />,
            color: "#ff9800",
          },
          {
            title: "Active Staff",
            value: "18",
            icon: <Group />,
            color: "#4caf50",
          },
          {
            title: "Top Item",
            value: "Burgers",
            icon: <RestaurantMenu />,
            color: "#f44336",
          },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                background: item.color,
                color: "#fff",
                boxShadow: "none",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)" }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{item.title}</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts & Insights */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Sales Trends */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📈 Weekly Sales (Dine-in vs Takeout)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="dineIn"
                    stroke="#1976d2"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="takeOut"
                    stroke="#ff9800"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Items */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🍕 Top Selling Items
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topMenuData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                  >
                    {topMenuData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Staff Performance + Notifications */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Staff Performance */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                👩‍🍳 Staff Performance (Sales)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={staffPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications / Tasks */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🔔 Notifications
              </Typography>
              <List>
                <ListItem>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <ListItemText
                    primary="New staff member added"
                    secondary="2 hrs ago"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <Notifications color="warning" sx={{ mr: 1 }} />
                  <ListItemText
                    primary="Low stock: Tomatoes"
                    secondary="5 hrs ago"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <Notifications color="error" sx={{ mr: 1 }} />
                  <ListItemText
                    primary="Failed transaction detected"
                    secondary="1 day ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {[
          { label: "Manage Staff", icon: <Group /> },
          { label: "Manage Menu", icon: <RestaurantMenu /> },
          { label: "Reports", icon: <Assignment /> },
          { label: "Settings", icon: <Settings /> },
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                textAlign: "center",
                "&:hover": { background: "#f0f7ff", cursor: "pointer" },
              }}
            >
              <CardContent>
                <Box sx={{ fontSize: 40, color: "#1976d2", mb: 1 }}>
                  {item.icon}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {item.label}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Button size="small" variant="outlined">
                  Open
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
