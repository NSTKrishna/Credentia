export const maskAadhaar = (num: string): string => {
  return 'XXXX-XXXX-' + num.slice(-4);
};

export const maskPAN = (pan: string): string => {
  return pan.slice(0, 2) + 'XXXXX' + pan.slice(-3);
};
