import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('external_reference');

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
          ¡Pago confirmado!
        </h1>
        <p className="text-neutral-500 mb-2">
          Tu pedido fue procesado correctamente. En breve recibirás un email con los detalles.
        </p>
        {orderId && (
          <p className="text-sm text-neutral-400 font-mono mb-8">
            #{orderId.slice(-8).toUpperCase()}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/orders">
              <ShoppingBag className="h-4 w-4" />
              Ver mis pedidos
            </Link>
          </Button>
          <Button asChild className="gap-2 gradient-aqua text-primary-foreground">
            <Link to="/">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
