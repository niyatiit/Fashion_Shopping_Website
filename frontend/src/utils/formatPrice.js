// Formats a number as Indian Rupee currency, e.g. 129900 -> "₹1,29,900"
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

// Returns the integer discount percentage between an original and discounted price
export const getDiscountPercent = (price, discountPrice) => {
  if (!discountPrice || discountPrice <= 0 || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export default formatPrice;