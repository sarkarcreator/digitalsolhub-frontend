type PdfExportOptions = {
  orientation?: 'portrait' | 'landscape';
  margin?: number;
};

export async function exportElementAsPdf(element: HTMLElement, filename: string, options: PdfExportOptions = {}) {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const html2canvas = html2canvasModule.default;
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: Math.max(2, window.devicePixelRatio || 1),
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = options.margin ?? 0;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;
  const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, width, height, undefined, 'FAST');
  pdf.save(filename);
}
