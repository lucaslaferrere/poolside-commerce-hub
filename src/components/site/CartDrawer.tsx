import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/types/shop';
import { buildWhatsAppLink, cartWhatsAppMessage } from '@/lib/whatsapp';

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, close, setQty, remove, subtotal } = useCart();

  const total = subtotal();

  const handleWhatsApp = () => {
    const link = buildWhatsAppLink(cartWhatsAppMessage(items, total));
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col top-[34px] h-[calc(100vh-34px)]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="h-5 w-5 text-secondary" />
            Tu carrito ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full grid place-items-center text-center text-muted-foreground py-16">
              <div>
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Tu carrito está vacío</p>
                <p className="text-xs mt-1">Explorá la tienda y agregá productos</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      loading="lazy"
                      className="h-16 w-16 rounded-md object-cover bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{item.name}</p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setQty(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive" onClick={() => remove(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between font-display">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">El envío se calcula al finalizar.</p>
            <Button className="w-full gradient-aqua text-primary-foreground hover:opacity-95" size="lg" onClick={handleCheckout}>
              Finalizar compra
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={handleWhatsApp}>
              <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
