import useMenuStore from "../lib/menuStore";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from '../lib/restaurantStore';

export const printReceipt = async (status: string) => {
  const printWindow = window.open("", "", `width=350,height=500`) as unknown as Window;
  if (!printWindow) return;
  const htmlContent = generatePrintHTML(status);
  printWindow.document.open();
  printWindow.document.writeln(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => {
    const bodyHeight = printWindow.document.body.scrollHeight;
    printWindow.resizeTo(350, bodyHeight + 50);
    printWindow.print();
    printWindow.close();
  };
};

const generatePrintHTML = (status: string) => {
  const { currentOrderItems, chosenTableSession }: any = useMenuStore.getState();
  const { user }: any = useAuthStore.getState();
  const { selectedRestaurant }: any = useRestaurantStore.getState();

  const rows = (currentOrderItems || []).map((item: any) => `
    <tr>
      <td>${item?.item_name?.toUpperCase()}</td>
      <td style="text-align: right">£${item?.unit_price?.toFixed(2)}</td>
      <td style="text-align: center">${item?.quantity}</td>
      <td style="text-align: right">£${(item?.unit_price * item?.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <html>
      <head><style>body { font-family: sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 5px; }</style></head>
      <body>
        <h2 style="text-align: center">${selectedRestaurant?.name?.toUpperCase() || "DINEMATE"}</h2>
        <p style="text-align: center">${status === "close" ? "Official Receipt" : "Bill"}</p>
        <hr/>
        <p>Order No: ${chosenTableSession?.order_id || "N/A"}</p>
        <p>Table: ${chosenTableSession?.table_number || "N/A"}</p>
        <table>
          <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><th colspan="3">Grand Total</th><th>£${chosenTableSession?.order_total?.toFixed(2) || "0.00"}</th></tr></tfoot>
        </table>
        <p style="text-align: center; margin-top: 20px"><small>${status === "close" ? "THANK YOU!" : "NOT AN OFFICIAL RECEIPT"}</small></p>
      </body>
    </html>
  `;
};
