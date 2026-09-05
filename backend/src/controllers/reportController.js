const Quotation = require('../models/Quotation');
const { buildSalesReport } = require('../utils/reportGenerator');
const PDFDocument = require('pdfkit');

const loadQuotations = async (req) => {
  const query = {};
  if (req.user.role === 'sales_rep') query.salesRep = req.user.id;
  if (req.query.status) query.status = req.query.status;
  const quotations = await Quotation.find(query)
    .populate('salesRep', 'name email')
    .populate('customer', 'name email')
    .sort({ createdAt: -1 }).lean();
  return quotations;
};

exports.getSalesReport = async (req, res) => {
  const quotations = await loadQuotations(req);
  res.json({ success: true, data: buildSalesReport(quotations) });
};

exports.exportSalesCsv = async (req, res) => {
  const quotations = await loadQuotations(req);
  const rows = [['Quote', 'Customer', 'Sales Rep', 'Status', 'Approval Status', 'Amount', 'Created At'], ...quotations.map((quote) => [quote.quoteNumber, quote.customer?.name || '', quote.salesRep?.name || '', quote.status, quote.approvalStatus, quote.totalAmount || 0, new Date(quote.createdAt).toISOString()])];
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="dealflow360-report.csv"');
  res.send(csv);
};

exports.exportSalesPdf = async (req, res) => {
  const quotations = await loadQuotations(req);
  const report = buildSalesReport(quotations);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="dealflow360-report.pdf"');
  const pdf = new PDFDocument({ margin: 48 });
  pdf.pipe(res);
  pdf.fontSize(22).fillColor('#176b52').text('DealFlow360 Sales Report');
  pdf.moveDown().fontSize(12).fillColor('#17231f').text(`Total quotations: ${report.totalQuotes}`);
  pdf.text(`Total value: INR ${Number(report.totalValue).toLocaleString('en-IN')}`);
  pdf.moveDown().fontSize(14).text('Quotation register');
  quotations.forEach((quote) => pdf.fontSize(10).text(`${quote.quoteNumber || quote._id} | ${quote.customer?.name || 'Customer'} | ${quote.status} | INR ${Number(quote.totalAmount || 0).toLocaleString('en-IN')}`));
  pdf.end();
};
