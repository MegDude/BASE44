export function calculateDiscount({ discountType, discountValue, originalAmount }) {
  if (discountType === "complimentary_item" || discountType === "custom") {
    return { originalAmount };
  }
  if (!Number.isFinite(originalAmount) || originalAmount < 0) {
    throw new Error("A valid original amount is required");
  }
  if (discountType === "percentage") {
    const percentage = Math.min(100, Math.max(0, Number(discountValue) || 0));
    const discountAmount = Math.round(originalAmount * (percentage / 100) * 100) / 100;
    return { originalAmount, discountAmount, finalAmount: Math.round((originalAmount - discountAmount) * 100) / 100 };
  }
  const discountAmount = Math.min(originalAmount, Math.max(0, Number(discountValue) || 0));
  return { originalAmount, discountAmount, finalAmount: Math.round((originalAmount - discountAmount) * 100) / 100 };
}
