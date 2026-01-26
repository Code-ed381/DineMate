import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
} from "@mui/material";
import DashboardHeader from "./components/dashboard-header";
import useCashierStore from "../../lib/cashierStore";
import TransactionHistory from "./components/transaction-histroy";
import PaymentBreakdownChart from "./components/payment-breakdown";
import SalesTrendChart from "./components/sales-trend-chart";
import KpiDashboard from "./components/kpi-dashboard";
import CashierDashboardSkeleton from "./components/skeletons/cashier-dashboard-skeleton";

interface Transaction {
  id: string;
  order: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

interface CashierReportsProps {
  initialTransactions?: Transaction[];
  salesData?: { day: string; sales: number }[];
}

const CashierReports: React.FC<CashierReportsProps> = () => {
  const {
      activeSeesionByRestaurantLoaded,
      getActiveSessionByRestaurant,
      allSessions,
  } = useCashierStore();

  useEffect(() => {
    getActiveSessionByRestaurant();
  }, [getActiveSessionByRestaurant]);

  return (
    <>
      {
        activeSeesionByRestaurantLoaded ? (
          <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <DashboardHeader
          title="Cashier Reports"
          description="Clean, consistent view — filters on the left, visual insights on the right."
          background="linear-gradient(135deg, rgb(25, 187, 31) 0%, rgb(199, 128, 102) 100%)"
          color="#fff"
        />

        {/* KPIs + Charts */}
        <KpiDashboard allSessions={allSessions}/>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <SalesTrendChart allSessions={allSessions}/>
          </Grid>

          <Grid item xs={12} md={4}>
            <PaymentBreakdownChart allSessions={allSessions}/>
          </Grid>

          {/* Transaction Table */}
          <Grid item xs={12}>
            <TransactionHistory allSessions={allSessions} />
          </Grid>
        </Grid>
          </Box>
        ) : (
          <CashierDashboardSkeleton />
        )}
    </>
  );
};

export default CashierReports;
