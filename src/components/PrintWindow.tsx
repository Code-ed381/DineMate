import useRestaurantStore from '../lib/restaurantStore';

export const printReceipt = async (
  orderId: string,
  waiterName: string,
  tableNo: string | number,
  totalQty: number,
  totalPrice: number,
  orderItems: any[],
  totalPaid: string,
  cash: string,
  card: string,
  change: string
) => {
  const printWindow = window.open("", "", `width=350,height=500`) as unknown as Window;
  if (!printWindow) return;
  const htmlContent = generatePrintHTML(
    orderId,
    waiterName,
    tableNo,
    totalQty,
    totalPrice,
    orderItems,
    totalPaid,
    cash,
    card,
    change
  );
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

const generatePrintHTML = (
  orderId: string,
  waiterName: string,
  tableNo: string | number,
  totalQty: number,
  totalPrice: number,
  orderItems: any[],
  totalPaid: string,
  cash: string,
  card: string,
  change: string
) => {
  // Use passed arguments instead of store
  const { selectedRestaurant } = useRestaurantStore.getState(); // Keep restaurant store for name

  const rows = (orderItems || []).map((item: any) => `
    <tr>
      <td>${item?.item_name?.toUpperCase() || item?.name?.toUpperCase()}</td>
      <td style="text-align: right">£${(item?.unit_price || item?.price)?.toFixed(2)}</td>
      <td style="text-align: center">${item?.quantity || item?.qty}</td>
      <td style="text-align: right">£${((item?.unit_price || item?.price) * (item?.quantity || item?.qty)).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <html>
      <head><style>body { font-family: sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 5px; }</style></head>
      <body>
        <h2 style="text-align: center">${selectedRestaurant?.name?.toUpperCase() || "DINEMATE"}</h2>
        <p style="text-align: center">Official Receipt</p>
        <hr/>
        <p>Order No: ${orderId || "N/A"}</p>
        <p>Table: ${tableNo || "N/A"}</p>
        <p>Waiter: ${waiterName || "N/A"}</p>
        <table>
          <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr><th colspan="3">Grand Total</th><th>£${totalPrice?.toFixed(2) || "0.00"}</th></tr>
            <tr><th colspan="3">Cash Paid</th><th>£${cash}</th></tr>
            <tr><th colspan="3">Card Paid</th><th>£${card}</th></tr>
            <tr><th colspan="3">Change</th><th>£${change}</th></tr>
          </tfoot>
        </table>
        <p style="text-align: center; margin-top: 20px"><small>THANK YOU!</small></p>
      </body>
    </html>
  `;
};
