import useMenuStore from "../lib/menuStore";
import useAuthStore from "../lib/authStore";
import useRestaurantStore from '../lib/restaurantStore';

// Generate the HTML content for the bill print window
export const printReceipt = async (status) => {
  // Open a new window
  const printWindow = window.open("", "", `width=350,height=500`);

  // Generate the HTML content
  const htmlContent = generatePrintHTML(status);

  // Write the content to the new window
  printWindow.document.open();
  printWindow.document.writeln(htmlContent);
  printWindow.document.close();

  // Adjust window size based on actual content
  printWindow.onload = () => {
    const bodyHeight = printWindow.document.body.scrollHeight;
    printWindow.resizeTo(350, bodyHeight + 50);
    printWindow.print();
    printWindow.close();
  };
};

// Function to generate the HTML content for the print window
const generatePrintHTML = (status) => {
  const { chosenTableOrderItems, chosenTableSession } = useMenuStore.getState();
  const { user } = useAuthStore.getState();
  const { selectedRestaurant } = useRestaurantStore.getState();

  const rows = (chosenTableOrderItems || [])
    .map(
      (item) => `
      <tr>
        <td class="fw-semibold">${item?.menu_item?.name?.toUpperCase()}</td>
        <td class="text-end">£${item?.price?.toFixed(2)}</td>
        <td class="text-center">${item?.quantity}</td>
        <td class="text-end">£${(item?.price * item?.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <html>
      <head>
        <title>Print Bill</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; margin: 40px; }
          h4, h6 { margin: 0; }
          .bill-header { border-bottom: 2px solid #000; margin-bottom: 15px; padding-bottom: 10px; }
          .table-modern {
            border: 2px solid #000;
            border-collapse: collapse;
            width: 100%;
          }
          .table-modern th, .table-modern td {
            border: 1px solid #000 !important;
            padding: 8px 12px !important;
          }
          .table-modern thead th {
            background: #343a40;
            color: #fff;
            text-transform: uppercase;
            font-size: 13px;
          }
          .table-modern tbody tr:nth-child(odd) {
            background: #f9f9f9;
          }
          .totals td {
            font-weight: bold;
            border-top: 2px solid #000 !important;
          }
          .logo {
            text-align: center;
            margin-bottom: 10px;
          }
          .logo img {
            border-radius: 8px;
            object-fit: contain;
          }
          .restaurant-name {
            text-align: center;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .bill-title {
            text-align: center;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <!-- Logo + Header -->
        <div class="logo">
          <img src="${
            selectedRestaurant?.restaurants?.logo || ""
          }" alt="Logo" width="120" height="120">
        </div>
        <h4 class="restaurant-name">${
          selectedRestaurant?.restaurants?.name.toUpperCase() || ""
        }</h4>
        <p class="bill-title">${status === "close" ? "Official Receipt" : "Bill"}</p>
        
        <div class="bill-header">
          <p class="mb-1"><strong>Order No:</strong> ${
            chosenTableSession.order_id
          }</p>
          <p class="mb-1"><strong>Waiter:</strong> ${
            user?.user?.user_metadata?.firstName || ""
          } ${user?.user?.user_metadata?.lastName || ""}</p>
          <p class="mb-0"><strong>Table:</strong> ${
            chosenTableSession.table_number
          }</p>
        </div>

        <!-- Items Table -->
        <table class="table-modern">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-end">Price</th>
              <th class="text-center">Qty</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr class="totals">
              <td colspan="3">Total</td>
              <td class="text-end">£${chosenTableSession.order_total.toFixed(
                2
              )}</td>
            </tr>
            <tr>
              <td colspan="3">Discount</td>
              <td class="text-end">£0.00</td>
            </tr>
            <tr>
              <td colspan="3">Grand Total</td>
              <td class="text-end">£${chosenTableSession.order_total.toFixed(
                2
              )}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Footer -->
        <p class="text-center mt-4">
          <small>
            <em>
                <strong>
                    ${status === "close" ? "THANK YOU FOR YOUR PAYMENT" : "NB: THIS IS NOT AN OFFICIAL PAYMENT RECEIPT. PLEASE INSIST ON GETTING RECEIPT AFTER PAYMENT"}
                </strong>
            </em>
          </small>
        </p>
      </body>
    </html>
  `;
};
