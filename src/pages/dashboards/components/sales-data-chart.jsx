import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesBarChart = ({ orders = [] }) => {
  const salesData = useMemo(() => {
    // Build the last 7 days (today inclusive)
    const today = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i)); // oldest first
      return d;
    });

    // Init totals map {dateKey: 0}
    const totalsByDate = last7Days.reduce((acc, d) => {
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      acc[key] = 0;
      return acc;
    }, {});

    // Sum order totals into matching days
    orders.forEach((order) => {
      if (!order.opened_at || order.order_total == null) return;
      const key = new Date(order.opened_at).toISOString().split("T")[0];
      if (totalsByDate[key] !== undefined) {
        totalsByDate[key] += Number(order.order_total);
      }
    });

    // Shape into Chart.js format
    const labels = last7Days.map(
      (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) // e.g. 29 Sep
    );
    const data = last7Days.map(
      (d) => totalsByDate[d.toISOString().split("T")[0]]
    );

    return {
      labels,
      datasets: [
        {
          label: "Sales Performance (Last 7 Days)",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [orders]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `Total: £${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Sales (£)",
        },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={salesData} options={options} />;
};

export default SalesBarChart;