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
 * Supports single sheet (data as array) or multi-sheet (data as record mapping name to array).
 */
export const exportToExcel = (data: any[] | Record<string, any[]>, filename: string) => {
  if (!data || (Array.isArray(data) && !data.length)) {
    console.warn("No data to export");
    return;
  }

  const workbook = XLSX.utils.book_new();

  if (Array.isArray(data)) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  } else {
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31)); // sheet names limited to 31 chars
    });
  }
  
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
 * Generates a structured PDF with a table or multiple tables.
 * Data can be a simple array of objects or an array of sections { title, data }.
 */
export const exportToPDF = (data: any[] | { title: string; data: any[] }[], filename: string, title: string = "Data Export") => {
  if (!data || (Array.isArray(data) && !data.length)) {
    console.warn("No data to export");
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(25, 118, 210); // Primary color
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${dayjs().format("DD MMM YYYY, HH:mm")}`, 14, 28);
  
  let currentY = 35;

  const renderTable = (tableData: any[], tableTitle?: string) => {
    if (!tableData.length) return;
    
    if (tableTitle) {
        doc.setFontSize(14);
        doc.setTextColor(50);
        doc.text(tableTitle, 14, currentY);
        currentY += 5;
    }

    const keys = Object.keys(tableData[0]);
    const rows = tableData.map(obj => keys.map(k => obj[k]));

    autoTable(doc, {
      head: [keys],
      body: rows,
      startY: currentY,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { top: 10 },
      didDrawPage: (data) => {
        currentY = data.cursor?.y || currentY;
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  };

  if (Array.isArray(data) && data.length > 0 && !(data[0] as any).data) {
    // Single table mode
    renderTable(data as any[]);
  } else {
    // Multi-section mode
    (data as { title: string; data: any[] }[]).forEach(section => {
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }
        renderTable(section.data, section.title);
    });
  }

  doc.save(`${filename}_${dayjs().format("YYYYMMDD_HHmm")}.pdf`);
};
