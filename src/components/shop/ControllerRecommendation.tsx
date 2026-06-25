import { useMemo } from 'react';
import { Zap, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/store/cart';
import { formatPrice, hasDiscount, applyDiscount } from '@/types/shop';
import { resolveImageUrl } from '@/lib/api';
import type { ShopProduct } from '@/types/shop';

// ── Controller IDs ────────────────────────────────────────────────────────────
const PCE_100_ID  = '6a0207a50e93848ce744ba9a'; // PCE-100-SYS 24V 96W + Control remoto
const PCE_60_ID   = '6a026e3e169c2eb8902e6d45'; // PCE 60-12 + Control remoto
const TE3_ID      = '6a0207a50e93848ce744ba96'; // TE3 WW + Control remoto
const TE6_ID      = '6a0207a50e93848ce744ba93'; // TE6 + Control remoto
const TE9_ID      = '6a0207a50e93848ce744ba94'; // TE9 + Control remoto
const TE15_ID     = '6a0207a50e93848ce744ba95'; // TE15 + Control remoto

const OSIRE_BRANDS = ['OSIRE'];
const TE_BRANDS    = ['HORUS', 'NAZAR', 'POOLIGHT'];

// Returns the recommended controller ID(s) for a given quantity of TE-line luminarias.
function getTeControllers(qty: number): string[] {
  if (qty <= 3)  return [PCE_60_ID, TE3_ID];
  if (qty <= 6)  return [TE6_ID];
  if (qty <= 9)  return [TE9_ID];
  if (qty <= 15) return [TE15_ID];
  // 16+: TE15 + TE6 combination
  return [TE15_ID, TE6_ID];
}

interface Props {
  product: ShopProduct;
  /** Quantity currently selected in the product page (not yet in cart) */
  pendingQty: number;
}

export function ControllerRecommendation({ product, pendingQty }: Props) {
  const { data: products = [] } = useProducts();
  const cartItems = useCart((s) => s.items);
  const add       = useCart((s) => s.add);
  const triggerSplash = useCart((s) => s.triggerSplash);
  const openCart  = useCart((s) => s.open);

  const brand = product.brand?.toUpperCase() ?? '';
  const isOsire = OSIRE_BRANDS.includes(brand);
  const isTe    = TE_BRANDS.includes(brand);

  // Total luminarias of the same brand already in cart + pending qty
  const totalLuminarias = useMemo(() => {
    if (!isTe) return pendingQty;
    const inCart = cartItems
      .filter((i) => {
        // Cart item id format: productId or productId|color|size
        const pid = i.id.split('|')[0];
        const p = products.find((p) => p.id === pid);
        return p && TE_BRANDS.includes(p.brand?.toUpperCase() ?? '');
      })
      .reduce((sum, i) => sum + i.quantity, 0);
    return inCart + pendingQty;
  }, [cartItems, products, isTe, pendingQty]);

  const controllerIds = useMemo(() => {
    if (isOsire) return [PCE_100_ID];
    if (isTe)    return getTeControllers(totalLuminarias);
    return [];
  }, [isOsire, isTe, totalLuminarias]);

  const controllers = useMemo(
    () => controllerIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as ShopProduct[],
    [controllerIds, products],
  );

  if (!isOsire && !isTe) return null;
  if (controllers.length === 0) return null;

  const addController = (ctrl: ShopProduct) => {
    const price = hasDiscount(ctrl.discount_percent)
      ? applyDiscount(ctrl.base_price, ctrl.discount_percent)
      : ctrl.base_price;
    add({
      id: ctrl.id,
      name: ctrl.name,
      price,
      image_url: resolveImageUrl(ctrl.images?.[0]) || null,
      type: 'product',
      variant_sku: '',
    });
    triggerSplash();
    setTimeout(() => openCart(), 650);
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
          {isTe
            ? `Controlador recomendado para ${totalLuminarias} luminaria${totalLuminarias !== 1 ? 's' : ''}`
            : 'Controlador recomendado'}
        </p>
      </div>

      <div className="space-y-2">
        {controllers.map((ctrl) => {
          const price = hasDiscount(ctrl.discount_percent)
            ? applyDiscount(ctrl.base_price, ctrl.discount_percent)
            : ctrl.base_price;
          const alreadyInCart = cartItems.some((i) => i.id === ctrl.id);

          return (
            <div key={ctrl.id} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-amber-100">
              {ctrl.images?.[0] && (
                <img
                  src={resolveImageUrl(ctrl.images[0])}
                  alt={ctrl.name}
                  className="h-12 w-12 rounded-md object-cover shrink-0 border border-slate-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{ctrl.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(price)}</p>
              </div>
              <Button
                size="sm"
                variant={alreadyInCart ? 'outline' : 'default'}
                onClick={() => addController(ctrl)}
                className="shrink-0 gap-1.5 text-xs h-8"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {alreadyInCart ? 'Agregar otro' : 'Agregar'}
              </Button>
            </div>
          );
        })}
      </div>

      {isTe && totalLuminarias > 15 && (
        <p className="text-[11px] text-amber-700">
          Para {totalLuminarias} luminarias se recomienda combinar TE15 + TE6 en dos circuitos independientes.
        </p>
      )}
    </div>
  );
}
