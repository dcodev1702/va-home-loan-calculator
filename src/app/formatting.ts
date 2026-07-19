export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const num = (value: string) => Number(value) || 0;
export const id = () => Math.random().toString(36).slice(2, 9);
