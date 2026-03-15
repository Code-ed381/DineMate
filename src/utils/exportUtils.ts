import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  const separator = ",";
  const keys = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(keys.join(separator));

  // Add data rows
  for (const row of data) {
    const values = keys.map((k) => {
      let cell = row[k] === null || row[k] === undefined ? "" : row[k];
      
      // Handle special types and escaping
      if (cell instanceof Date) {
        cell = cell.toISOString();
      } else {
        cell = cell.toString().replace(/"/g, '""');
      }

      // Escape commas, newlines and quotes
      if (/[",\n]/.test(cell)) {
        cell = `"${cell}"`;
      }
      return cell;
    });
    csvRows.push(values.join(separator));
  }

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${dayjs().format("YYYYMMDD_HHmm")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Exports data to an Excel (XLSX) file.
 */
export const exportToExcel = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Clean filename and add timestamp
  const safeFilename = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
};

/**
 * Exports data to a TXT file (Aligned Columns).
 */
export const exportToTXT = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  const keys = Object.keys(data[0]);
  
  // Calculate max widths for each column
  const widths = keys.map(key => {
    const values = data.map(row => String(row[key] ?? "").length);
    return Math.max(key.length, ...values) + 2;
  });

  const header = keys.map((key, i) => key.padEnd(widths[i])).join("");
  const separator = widths.map(w => "-".repeat(w)).join("");
  
  const body = data.map(row => {
    return keys.map((key, i) => String(row[key] ?? "").padEnd(widths[i])).join("");
  }).join("\n");

  const content = `${header}\n${separator}\n${body}`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${dayjs().format("YYYYMMDD_HHmm")}.txt`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates a structured PDF with a table.
 */
export const exportToPDF = (data: any[], filename: string, title: string = "Data Export") => {
  if (!data || !data.length) {
    console.warn("No data to export");
    window.print(); // Fallback if no tabular data provided
    return;
  }

  const doc = new jsPDF();
  const keys = Object.keys(data[0]);
  const rows = data.map(obj => keys.map(k => obj[k]));

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${dayjs().format("DD MMM YYYY, HH:mm")}`, 14, 30);
  
  autoTable(doc, {
    head: [keys],
    body: rows,
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [25, 118, 210] }, // Primary color
    styles: { fontSize: 8, cellPadding: 2 },
  });

  doc.save(`${filename}_${dayjs().format("YYYYMMDD_HHmm")}.pdf`);
};
