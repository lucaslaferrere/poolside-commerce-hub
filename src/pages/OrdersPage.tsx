import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <h1 className="font-display text-3xl font-bold mb-6">Mis Pedidos</h1>

        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl bg-muted/30">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">Todavía no tenés pedidos</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando realices una compra, aparecerá aquí.
          </p>
          <Button asChild className="mt-6 gradient-aqua text-primary-foreground">
            <Link to="/#tienda">Explorar productos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
