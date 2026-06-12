import { useState, useMemo } from 'react';
import { Copy, Check, Plus, Minus, Trash2, Link2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/hooks/useProducts';
import { useKits } from '@/hooks/useKits';
import { apiPost } from '@/lib/api';
import { formatPrice, applyDiscount, hasDiscount } from '@/types/shop';
import { resolveImageUrl } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CartLinkItem {
  product_id: string;
  variant_sku: string;
  name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  type: 'product' | 'kit';
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CartLinkModal({ open, onOpenChange }: Props) {
  const { data: products = [] } = useProducts();
  const { data: kits = [] } = useKits();
  const [items, setItems] = useState<CartLinkItem[]>([]);
  const [search, setSearch] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) && (p.stock ?? 0) > 0);
  }, [products, search]);

  const filteredKits = useMemo(() => {
    const q = search.toLowerCase();
    return kits.filter((k) => k.name.toLowerCase().includes(q));
  }, [kits, search]);

  const addProduct = (p: typeof products[0]) => {
    const price = hasDiscount(p.discount_percent)
      ? applyDiscount(p.base_price, p.discount_percent)
      : p.base_price;
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === p.id && i.type === 'product');
      if (existing) return prev.map((i) => i.product_id === p.id && i.type === 'product' ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        product_id: p.id,
        variant_sku: p.variants?.[0]?.sku ?? '',
        name: p.name,
        image_url: resolveImageUrl(p.images?.[0]) ?? '',
        unit_price: price,
        quantity: 1,
        type: 'product',
      }];
    });
  };

  const addKit = (k: typeof kits[0]) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === k.id && i.type === 'kit');
      if (existing) return prev.map((i) => i.product_id === k.id && i.type === 'kit' ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        product_id: k.id,
        variant_sku: '',
        name: k.name,
        image_url: resolveImageUrl(k.image_url) ?? '',
        unit_price: Number(k.price),
        quantity: 1,
        type: 'kit',
      }];
    });
  };

  const updateQty = (idx: number, delta: number) => {
    setItems((prev) => prev
      .map((item, i) => i === idx ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0),
    );
  };

  const remove = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  const generate = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await apiPost<{ url: string }>('/admin/cart-links', { items });
      setGeneratedUrl(res.url);
    } catch {
      toast.error('No se pudo generar el link');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success('Link copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setItems([]);
    setGeneratedUrl('');
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-brand" />
            Generar link de carrito
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[70vh] overflow-hidden">
          {/* ── Selector de productos ── */}
          <div className="flex flex-col w-1/2 border-r border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar producto o kit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredProducts.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">Productos</p>
                  {filteredProducts.map((p) => {
                    const price = hasDiscount(p.discount_percent) ? applyDiscount(p.base_price, p.discount_percent) : p.base_price;
                    return (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
                      >
                        <div className="h-9 w-9 shrink-0 rounded-md bg-muted overflow-hidden">
                          {p.images?.[0] && <img src={resolveImageUrl(p.images[0])} className="h-full w-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(price)}</p>
                        </div>
                        <Plus className="h-4 w-4 text-brand shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
              {filteredKits.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 border-b border-border">Kits</p>
                  {filteredKits.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => addKit(k)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-md bg-muted overflow-hidden">
                        {k.image_url && <img src={resolveImageUrl(k.image_url)} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{k.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(Number(k.price))}</p>
                      </div>
                      <Plus className="h-4 w-4 text-brand shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              {filteredProducts.length === 0 && filteredKits.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">Sin resultados</p>
              )}
            </div>
          </div>

          {/* ── Carrito ── */}
          <div className="flex flex-col w-1/2 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center px-6">Agregá productos desde la izquierda</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} c/u</p>
                        {item.type === 'kit' && <Badge variant="outline" className="text-[10px] mt-0.5">Kit</Badge>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => updateQty(idx, -1)} className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(idx, 1)} className="h-6 w-6 rounded border flex items-center justify-center hover:bg-muted">
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => remove(idx)} className="h-6 w-6 rounded flex items-center justify-center text-red-400 hover:bg-red-50 ml-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer del carrito */}
            <div className="border-t border-border px-4 py-4 space-y-3">
              {items.length > 0 && (
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              )}

              {generatedUrl ? (
                <div className="space-y-2">
                  <Separator />
                  <p className="text-xs text-muted-foreground">Link generado (válido 30 días):</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={generatedUrl}
                      className="flex-1 text-xs bg-muted rounded px-2 py-1.5 font-mono border border-border overflow-x-auto"
                    />
                    <Button size="sm" variant="outline" onClick={copy} className={cn('shrink-0', copied && 'text-emerald-600')}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={reset}>
                    Nuevo carrito
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={generate}
                  disabled={items.length === 0 || loading}
                  className="w-full gradient-aqua text-primary-foreground"
                >
                  {loading ? 'Generando...' : 'Generar link'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
