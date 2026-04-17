import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Kit } from '@/types/shop';
import { formatPrice } from '@/types/shop';
import { useCart } from '@/store/cart';
import { toast } from 'sonner';

export function KitsSection() {
  const [kits, setKits] = useState<Kit[]>([]);
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);

  useEffect(() => {
    supabase.from('kits').select('*').eq('featured', true).then(({ data }) => {
      if (data) setKits(data as unknown as Kit[]);
    });
  }, []);

  const handleAdd = (k: Kit) => {
    add({ id: k.id, name: k.name, price: Number(k.price), image_url: k.image_url, type: 'kit' });
    toast.success('Kit agregado', { description: k.name });
    open();
  };

  return (
    <section id="kits" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Combos</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 text-balance">Kits prearmados</h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Todo lo que necesitás en un solo paquete, con descuento por combo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kits.map((k, i) => {
            const discount = k.original_price ? Math.round(((Number(k.original_price) - Number(k.price)) / Number(k.original_price)) * 100) : 0;
            return (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-deep transition-shadow group">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {k.image_url && (
                      <img
                        src={k.image_url}
                        alt={k.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    {discount > 0 && (
                      <Badge className="absolute top-3 right-3 gradient-gold text-gold-foreground border-0 font-bold">
                        -{discount}%
                      </Badge>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 text-primary font-medium">
                        <Package className="h-3 w-3 mr-1" />
                        Pileta {k.pool_size}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-display font-bold text-lg leading-tight">{k.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{k.description}</p>
                    <div className="flex items-end gap-2">
                      {k.original_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(Number(k.original_price))}
                        </span>
                      )}
                      <span className="font-display font-bold text-xl text-primary">
                        {formatPrice(Number(k.price))}
                      </span>
                    </div>
                    <Button onClick={() => handleAdd(k)} className="w-full gradient-aqua text-primary-foreground">
                      <Plus className="h-4 w-4" /> Agregar al carrito
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
