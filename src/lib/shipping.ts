export interface ShippingQuote {
  price: number;
  estimated_days: number;
}

export async function quoteShipping(zip: string): Promise<ShippingQuote> {
  const n = parseInt(zip.slice(0, 1), 10);
  if (n <= 1) return { price: 4500,  estimated_days: 3 };
  if (n <= 5) return { price: 7800,  estimated_days: 5 };
  return      { price: 12500, estimated_days: 7 };
}
