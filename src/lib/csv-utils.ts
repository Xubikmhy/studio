// src/lib/csv-utils.ts
export function arrayToCsv(headers: string[], data: (string | number | null | undefined)[][]): string {
  const csvRows = [];
  // Add headers
  csvRows.push(headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = row.map(value => {
      const stringValue = String(value === null || value === undefined ? '' : value);
      // Escape double quotes by doubling them, and wrap in double quotes if value contains a comma, double quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\r\n'); // Use CRLF for better compatibility with Excel
}

export function downloadCsv(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', safeFilename);
  
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
