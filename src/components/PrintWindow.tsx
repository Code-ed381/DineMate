import { getCurrencySymbol } from '../utils/currency';
import { Restaurant } from '../lib/restaurantStore';

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
  change: string,
  restaurant?: Restaurant | null
) => {
  const printWindow = window.open("", "", `width=400,height=600`) as unknown as Window;
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
    change,
    restaurant
  );
  printWindow.document.open();
  printWindow.document.writeln(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => {
    const bodyHeight = printWindow.document.body.scrollHeight;
    printWindow.resizeTo(400, bodyHeight + 50);
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
  change: string,
  restaurant?: Restaurant | null
) => {
  const currency = getCurrencySymbol();

  const rows = (orderItems || []).map((item: any) => `
    <tr>
      <td style="padding: 4px 0;">
        <div style="font-weight: bold;">${(item?.menu_item_name || item?.item_name || item?.name || "Unknown Item").toUpperCase()}</div>
        ${item?.selected_modifiers?.length > 0 ? `<div style="font-size: 0.8em; color: #555;"> + ${item.selected_modifiers.map((m: any) => m.name).join(", ")}</div>` : ''}
        ${item?.notes ? `<div style="font-size: 0.8em; font-style: italic;">Note: ${item.notes}</div>` : ''}
      </td>
      <td style="text-align: right; vertical-align: top; padding: 4px 0;">${currency}${(item?.unit_price || item?.price)?.toFixed(2)}</td>
      <td style="text-align: center; vertical-align: top; padding: 4px 0;">${item?.quantity || item?.qty}</td>
      <td style="text-align: right; vertical-align: top; padding: 4px 0;">${currency}${((item?.unit_price || item?.price) * (item?.quantity || item?.qty)).toFixed(2)}</td>
    </tr>
  `).join("");

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Courier New', Courier, monospace; font-size: 14px; line-height: 1.2; color: #000; margin: 0; padding: 10px; }
          .container { max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 15px; }
          .logo { max-width: 80px; max-height: 80px; margin-bottom: 5px; }
          .restaurant-name { font-size: 18px; font-weight: bold; margin: 5px 0; }
          .details { font-size: 12px; margin-bottom: 2px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .order-info { margin-bottom: 10px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th { border-bottom: 1px dashed #000; padding: 5px 0; text-align: left; }
          tfoot th, tfoot td { padding-top: 5px; }
          .total-row { font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${restaurant?.logo ? `<img src="${restaurant.logo}" class="logo" />` : ''}
            <div class="restaurant-name">${restaurant?.name?.toUpperCase() || "DINEMATE"}</div>
            ${restaurant?.address_line_1 ? `<div class="details">${restaurant.address_line_1}</div>` : ''}
            ${restaurant?.city ? `<div class="details">${restaurant.city}${restaurant.state ? `, ${restaurant.state}` : ''}</div>` : ''}
            ${restaurant?.phone_number ? `<div class="details">Tel: ${restaurant.phone_number}</div>` : ''}
            ${restaurant?.website ? `<div class="details">${restaurant.website}</div>` : ''}
          </div>

          <div class="divider"></div>
          
          <div class="order-info">
            <div><strong>Order:</strong> ${String(orderId || "N/A").slice(-6).toUpperCase()}</div>
            <div><strong>Table:</strong> ${tableNo || "N/A"}</div>
            <div><strong>Waiter:</strong> ${waiterName || "N/A"}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleString()}</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Item</th>
                <th style="text-align: right; width: 20%;">Price</th>
                <th style="text-align: center; width: 15%;">Qty</th>
                <th style="text-align: right; width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="divider"></div>

          <table>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">GRAND TOTAL</td>
                <td style="text-align: right;">${currency}${totalPrice?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td colspan="3">CASH PAID</td>
                <td style="text-align: right;">${currency}${parseFloat(cash).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3">CARD PAID</td>
                <td style="text-align: right;">${currency}${parseFloat(card).toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td colspan="3">CHANGE</td>
                <td style="text-align: right;">${currency}${change}</td>
              </tr>
            </tfoot>
          </table>

          <div class="divider"></div>
          
          <div class="footer">
            <div>THANK YOU FOR DINING WITH US!</div>
            <div style="margin-top: 5px;">Powered by DineMate</div>
          </div>
        </div>
      </body>
    </html>
  `;
};
