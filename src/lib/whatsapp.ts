// WhatsApp helper — replace with real number when client provides it
export const WHATSAPP_NUMBER = '5491100000000'; // Argentina format, sin "+" ni espacios
export const BUSINESS_NAME = 'Pooled';

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function cartWhatsAppMessage(items: { name: string; quantity: number; price: number }[], total: number) {
  const lines = items.map((i) => `• ${i.quantity}x ${i.name} — $${(i.price * i.quantity).toLocaleString('es-AR')}`);
  return `Hola ${BUSINESS_NAME}! Quiero consultar por estos productos:\n\n${lines.join('\n')}\n\nTotal estimado: $${total.toLocaleString('es-AR')}`;
}
