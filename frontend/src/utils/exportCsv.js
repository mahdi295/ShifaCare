// Simple, dependency-free CSV export helper.
// Takes an array of objects + column definitions, builds a CSV string,
// and triggers a browser download. No external library needed.

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in quotes if it contains a comma, quote, or newline; escape inner quotes.
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export an array of row objects to a downloaded CSV file.
 * @param {string} filename - e.g. "appointments.csv"
 * @param {Array<{ key: string, label: string }>} columns - column key (dot path supported) + header label
 * @param {Array<object>} rows - data rows
 */
export function exportToCsv(filename, columns, rows) {
  const getValue = (row, key) =>
    key.split('.').reduce((obj, part) => (obj == null ? '' : obj[part]), row);

  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(getValue(row, c.key))).join(',')
  );

  // Prepend BOM so Excel opens UTF-8 (Bangla text etc.) correctly.
  const csvContent = '\uFEFF' + [header, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
