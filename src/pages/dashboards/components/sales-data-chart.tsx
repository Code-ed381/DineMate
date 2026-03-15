import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalesBarChartProps {
  orders: any[];
}

const SalesBarChart: React.FC<SalesBarChartProps> = ({ orders = [] }) => {
  const salesData = useMemo(() => {
    const today = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    const totalsByDate = last7Days.reduce((acc: Record<string, number>, d) => {
      acc[d.toISOString().split("T")[0]] = 0;
      return acc;
    }, {});

    orders.forEach((order) => {
      if (!order.opened_at || order.order_total == null) return;
      const key = new Date(order.opened_at).toISOString().split("T")[0];
      if (totalsByDate[key] !== undefined) totalsByDate[key] += Number(order.order_total);
    });

    return {
      labels: last7Days.map(d => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })),
      datasets: [
        {
          label: "Sales Performance (Last 7 Days)",
          data: last7Days.map(d => totalsByDate[d.toISOString().split("T")[0]]),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [orders]);

  return (
    <div style={{ width: "100%", height: "250px" }}>
      <Bar 
        data={salesData} 
        options={{ 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              display: false 
            }, 
            tooltip: { 
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              callbacks: { 
                label: (ctx) => ` ₵${(ctx.raw as number).toFixed(2)}` 
              } 
            } 
          }, 
          scales: { 
            x: { 
              grid: { display: false },
              ticks: { font: { size: 10 } }
            }, 
            y: { 
              beginAtZero: true,
              ticks: { 
                font: { size: 10 },
                callback: (val) => `₵${val}`
              }
            } 
          } 
        }} 
      />
    </div>
  );
};

export default SalesBarChart;
