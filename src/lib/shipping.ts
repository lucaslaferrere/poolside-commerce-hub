import { apiPost } from './api';

export interface ShippingQuote {
  service_name: string;
  price: number;
  estimated_days: number;
}

export async function quoteShipping(postalCode: string): Promise<ShippingQuote> {
  return apiPost<ShippingQuote>('/shipping/quote', { postal_code: postalCode });
}
