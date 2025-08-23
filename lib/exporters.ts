import { jsPDF } from "jspdf";

function flatten(obj: any, prefix = "", res: Record<string, string> = {}): Record<string, string> {
  if (Array.isArray(obj)) {
    res[prefix] = obj
      .map((v) => (typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)))
      .join("; ");
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      flatten(value, newPrefix, res);
    }
  } else {
    res[prefix] = String(obj ?? "");
  }
  return res;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJson(data: unknown, filename = "good-project.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  download(blob, filename);
}

export function exportCsv(data: unknown, filename = "good-project.csv") {
  const flat = flatten(data);
  const rows = Object.entries(flat).map(([k, v]) => {
    const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    return `${esc(k)},${esc(v)}`;
  });
  const csv = ["key,value", ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  download(blob, filename);
}

export function exportPdf(data: unknown, filename = "good-project.pdf") {
  const doc = new jsPDF();
  const json = JSON.stringify(data, null, 2);
  const lines = doc.splitTextToSize(json, 180);
  doc.text(lines, 10, 10);
  doc.save(filename);
}
