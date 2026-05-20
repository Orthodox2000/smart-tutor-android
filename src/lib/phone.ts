export function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function toIndianE164(value: string) {
  const mobile = normalizeMobile(value);
  if (mobile.length !== 10) {
    throw new Error('Enter a valid 10-digit mobile number.');
  }

  return `+91${mobile}`;
}
