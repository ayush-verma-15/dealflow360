const calculateQuotationTotals = (lines = []) => {
  const totals = lines.reduce((result, line) => {
    const quantity = Number(line.quantity || 0);
    const unitPrice = Number(line.unitPrice || 0);
    const discountPercent = Number(line.discountPercent || 0);
    const taxRate = Number(line.taxRate || 0);
    const lineSubtotal = quantity * unitPrice;
    const lineDiscount = lineSubtotal * (discountPercent / 100);
    const taxableAmount = lineSubtotal - lineDiscount;
    const lineTax = taxableAmount * (taxRate / 100);
    const lineTotal = taxableAmount + lineTax;

    line.total = lineTotal;
    line.taxAmount = lineTax;

    result.subtotal += lineSubtotal;
    result.totalDiscount += lineDiscount;
    result.taxAmount += lineTax;
    result.totalAmount += lineTotal;
    return result;
  }, { subtotal: 0, totalDiscount: 0, taxAmount: 0, totalAmount: 0 });

  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Number(value.toFixed(2))]));
};

module.exports = calculateQuotationTotals;
