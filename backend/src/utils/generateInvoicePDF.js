const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

  doc.pipe(res);

  // Header
  doc
    .fontSize(22)
    .fillColor('#4f46e5')
    .text('VyaparSathi', 50, 50)
    .fontSize(10)
    .fillColor('#6b7280')
    .text('Inventory, Billing & Analytics ERP', 50, 78);

  doc
    .fontSize(18)
    .fillColor('#111827')
    .text('INVOICE', 400, 50, { align: 'right' })
    .fontSize(10)
    .fillColor('#6b7280')
    .text(`Invoice No: ${invoice.invoiceNumber}`, 400, 78, { align: 'right' })
    .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 400, 92, { align: 'right' });

  doc.moveTo(50, 115).lineTo(550, 115).strokeColor('#e5e7eb').stroke();

  // Customer Info
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Bill To:', 50, 135)
    .fontSize(10)
    .fillColor('#374151')
    .text(invoice.customer.name, 50, 152)
    .text(invoice.customer.phone, 50, 167);

  if (invoice.customer.address) {
    doc.text(invoice.customer.address, 50, 182);
  }

  // Table Header
  let y = 220;
  doc
    .fontSize(10)
    .fillColor('#fff')
    .rect(50, y, 500, 24)
    .fill('#4f46e5');

  doc
    .fillColor('#fff')
    .text('Product', 60, y + 7)
    .text('Qty', 280, y + 7)
    .text('Price', 350, y + 7)
    .text('Total', 460, y + 7);

  y += 24;

  // Table Rows
  doc.fillColor('#111827');
  invoice.items.forEach((item, index) => {
    const rowBg = index % 2 === 0 ? '#f9fafb' : '#ffffff';
    doc.rect(50, y, 500, 22).fill(rowBg);
    doc
      .fillColor('#111827')
      .fontSize(9.5)
      .text(item.product.name, 60, y + 6, { width: 200 })
      .text(String(item.quantity), 280, y + 6)
      .text(`Rs.${item.price}`, 350, y + 6)
      .text(`Rs.${item.quantity * item.price}`, 460, y + 6);
    y += 22;
  });

  y += 15;
  doc.moveTo(50, y).lineTo(550, y).strokeColor('#e5e7eb').stroke();
  y += 15;

  // Totals
  const subTotal = invoice.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  doc.fontSize(10).fillColor('#374151');
  doc.text('Subtotal:', 380, y).text(`Rs.${subTotal}`, 460, y);
  y += 16;
  doc.text('Discount:', 380, y).text(`Rs.${invoice.discount}`, 460, y);
  y += 16;
  doc.fontSize(12).fillColor('#111827').text('Total:', 380, y).text(`Rs.${invoice.totalAmount}`, 460, y);
  y += 18;
  doc.fontSize(10).fillColor('#374151').text('Paid:', 380, y).text(`Rs.${invoice.paidAmount}`, 460, y);
  y += 16;
  doc.fillColor('#dc2626').text('Due:', 380, y).text(`Rs.${invoice.dueAmount}`, 460, y);

  // Footer
 // Footer
  y += 40;
  doc
    .fontSize(9)
    .fillColor('#9ca3af')
    .text('Thank you for your business!', 50, y, { align: 'center', width: 500 });

  doc.end();
};

module.exports = generateInvoicePDF;