export const GST_RATE = 0.18;

export const normalizeDiscountPct = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.min(number, 100);
};

export const hardwareExGst = (hardwareTotal) => {
  const total = Number(hardwareTotal) || 0;
  return total > 0 ? total / (1 + GST_RATE) : 0;
};

export const calculateDiscountAmount = (hardwareTotal, discountPct) => {
  const base = hardwareExGst(hardwareTotal);
  return Math.round((base * normalizeDiscountPct(discountPct)) / 100);
};

export const deriveDiscountPct = (hardwareTotal, discountAmount) => {
  const base = hardwareExGst(hardwareTotal);
  const amount = Number(discountAmount) || 0;
  if (base <= 0 || amount <= 0) return 0;
  return Math.round((amount / base) * 10000) / 100;
};

export const calculateNetPayable = ({
  hardwareTotal = 0,
  consultancyAmount = 0,
  installationAmount = 0,
  discountAmount = 0,
}) => {
  const total =
    (Number(hardwareTotal) || 0) +
    (Number(consultancyAmount) || 0) +
    (Number(installationAmount) || 0) -
    (Number(discountAmount) || 0);
  return Math.round(total);
};
