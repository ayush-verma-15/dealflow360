const calculateDealHealth = (quotation, historicalAverageDiscount = 10, now = new Date()) => {
  const inactiveDays = quotation.updatedAt ? Math.max(0, Math.floor((now - new Date(quotation.updatedAt)) / 86400000)) : 0;
  const currentDiscount = quotation.subtotal ? (quotation.totalDiscount / quotation.subtotal) * 100 : 0;
  const stalledScore = inactiveDays >= 7 ? Math.min(100, inactiveDays * 10) : 0;
  const discountAnomalyScore = currentDiscount > historicalAverageDiscount
    ? Math.min(100, (currentDiscount - historicalAverageDiscount) * 8)
    : 0;
  const deliveryRiskScore = (quotation.warehouseSplit || []).some((split) => (split.items || []).some((item) => item.status === 'backorder')) ? 75 : 0;

  return {
    riskScore: Math.round(Math.max(stalledScore, discountAnomalyScore, deliveryRiskScore)),
    stalledScore: Math.round(stalledScore),
    discountAnomalyScore: Math.round(discountAnomalyScore),
    deliveryRiskScore: Math.round(deliveryRiskScore),
    inactiveDays,
    currentDiscount: Number(currentDiscount.toFixed(2)),
    historicalAverageDiscount
  };
};

module.exports = calculateDealHealth;
