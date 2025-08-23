import { jsPDF } from "jspdf";

export function exportJson(data: unknown, filename = "data.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function jsonToCsvRows(data: any, prefix = ""): string[] {
  const rows: string[] = [];
  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      data.forEach((v, i) => {
        rows.push(...jsonToCsvRows(v, `${prefix}[${i}]`));
      });
    } else {
      Object.entries(data).forEach(([key, value]) => {
        rows.push(...jsonToCsvRows(value, prefix ? `${prefix}.${key}` : key));
      });
    }
  } else {
    rows.push(`"${prefix.replace(/"/g, '""')}","${String(data).replace(/"/g, '""')}"`);
  }
  return rows;
}

export function exportCsv(data: unknown, filename = "data.csv") {
  const rows = jsonToCsvRows(data);
  const csv = ["key,value", ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdf(data: unknown, filename = "data.pdf") {
  const doc = new jsPDF();
  const json = JSON.stringify(data, null, 2);
  const lines = doc.splitTextToSize(json, 180);
  doc.text(lines, 10, 10);
  doc.save(filename);
}
