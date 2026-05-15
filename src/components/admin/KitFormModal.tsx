import { useState, useRef, useEffect, useMemo, type ChangeEvent } from 'react';
import { Upload, X, ImageIcon, AlertCircle, Check, ChevronDown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Kit } from '@/types/shop';
import type { AdminProduct } from '@/types/admin';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

function toFloat(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  const n = parseFloat(String(raw).replace(',', '.').trim());
  return Number.isFinite(n) ? n : 0;
}

interface FormFields {
  name: string;
  description: string;
  price: string;
  original_price: string;
  pool_size: string;
  featured: boolean;
}

const BLANK: FormFields = {
  name: '', description: '', price: '', original_price: '', pool_size: '', featured: false,
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kit: Kit | null;
  isSubmitting: boolean;
  onSubmit: (form: FormData, id?: string) => Promise<void>;
}

export function KitFormModal({ open, onOpenChange, kit, isSubmitting, onSubmit }: Props) {
  const [fields, setFields] = useState<FormFields>(BLANK);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin', 'products', 'all'],
    queryFn: () => apiGet<AdminProduct[]>('/admin/products'),
    enabled: open,
    select: (d) => Array.isArray(d) ? d : [],
  });

  useEffect(() => {
    if (!open) {
      setFields(BLANK);
      setSelectedProductIds([]);
      setImageFile(null);
      setImagePreview(null);
      setSubmitError(null);
      setProductPickerOpen(false);
      return;
    }
    if (kit) {
      setFields({
        name: kit.name,
        description: kit.description ?? '',
        price: String(kit.price),
        original_price: kit.original_price ? String(kit.original_price) : '',
        pool_size: kit.pool_size ?? '',
        featured: kit.featured,
      });
      setSelectedProductIds(kit.product_ids ?? []);
      setImagePreview(kit.image_url ?? null);
    }
  }, [open, kit]);

  useEffect(() => {
    if (!imageFile) return;
    return () => URL.revokeObjectURL(imagePreview ?? '');
  }, [imageFile]);

  const upd = (k: keyof Omit<FormFields, 'featured'>) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageFile) URL.revokeObjectURL(imagePreview ?? '');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imageFile) URL.revokeObjectURL(imagePreview ?? '');
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name.trim()) { setSubmitError('El nombre es requerido'); return; }
    if (!fields.price || toFloat(fields.price) <= 0) { setSubmitError('El precio debe ser mayor a 0'); return; }
    setSubmitError(null);

    const fd = new FormData();
    fd.append('name', fields.name.trim());
    fd.append('description', fields.description.trim());
    fd.append('price', String(toFloat(fields.price)));
    if (fields.original_price) fd.append('original_price', String(toFloat(fields.original_price)));
    if (fields.pool_size) fd.append('pool_size', fields.pool_size.trim());
    fd.append('featured', String(fields.featured));
    fd.append('product_ids', JSON.stringify(selectedProductIds));
    if (imageFile) fd.append('image', imageFile);

    try {
      await onSubmit(fd, kit?.id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const isEdit = !!kit;
  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  const suggestedPrice = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + (p.base_price ?? 0), 0),
    [selectedProducts],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[88vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-5 border-b border-neutral-200 shrink-0">
          <DialogTitle className="font-display text-xl font-semibold">
            {isEdit ? 'Editar kit' : 'Nuevo kit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {submitError && (
              <div role="alert" className="px-4 py-3 rounded-lg border border-danger/30 bg-danger/5 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                <p className="text-sm text-danger flex-1">{submitError}</p>
                <button type="button" onClick={() => setSubmitError(null)}>
                  <X className="h-4 w-4 text-neutral-400" />
                </button>
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-700">Nombre <span className="text-danger">*</span></Label>
              <Input value={fields.name} onChange={upd('name')} placeholder="Kit HORUS + PCE-60" />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-700">Descripción</Label>
              <Textarea rows={2} value={fields.description} onChange={upd('description')} placeholder="Todo lo que necesitás para..." className="resize-none text-sm" />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-700">Precio (ARS) <span className="text-danger">*</span></Label>
                <Input type="number" min="0" step="0.01" value={fields.price} onChange={upd('price')}
                  placeholder={suggestedPrice > 0 ? String(suggestedPrice.toFixed(2)) : '0.00'} />
                {suggestedPrice > 0 && (
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Suma de productos: <strong className="text-neutral-700">${suggestedPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                    <button
                      type="button"
                      onClick={() => setFields((f) => ({ ...f, price: suggestedPrice.toFixed(2) }))}
                      className="text-brand hover:underline font-medium"
                    >
                      Usar este precio
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-700">
                  Precio original <span className="text-[10px] text-neutral-400 font-normal">(opcional, tachado)</span>
                </Label>
                <Input type="number" min="0" step="0.01" value={fields.original_price} onChange={upd('original_price')} placeholder="0.00" />
              </div>
            </div>

            {/* Pool size + Featured */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-700">Tamaño de pileta</Label>
                <Input value={fields.pool_size} onChange={upd('pool_size')} placeholder="3x6m" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-700">Destacado en home</Label>
                <button
                  type="button"
                  onClick={() => setFields((f) => ({ ...f, featured: !f.featured }))}
                  className={cn(
                    'w-full h-9 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                    fields.featured
                      ? 'bg-brand/10 text-brand border-brand/30'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  {fields.featured && <Check className="h-3.5 w-3.5" />}
                  {fields.featured ? 'Sí, destacado' : 'No destacado'}
                </button>
              </div>
            </div>

            {/* Imagen */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-700">Imagen</Label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
              {imagePreview ? (
                <div className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-video">
                  <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  <button type="button" onClick={clearImage} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X className="h-3.5 w-3.5 text-neutral-700" />
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()} className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/95 text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <Upload className="h-3 w-3" /> Cambiar
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center gap-1.5 text-neutral-500 hover:text-brand hover:border-brand/40 hover:bg-brand/5 transition-all">
                  <ImageIcon className="h-7 w-7 opacity-50" />
                  <span className="text-sm font-medium">Subir imagen</span>
                  <span className="text-xs opacity-70">JPG, PNG o WebP</span>
                </button>
              )}
            </div>

            {/* Productos incluidos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-neutral-700">Productos incluidos</Label>
                <span className="text-xs text-neutral-400">{selectedProductIds.length} seleccionados</span>
              </div>

              {/* Selected chips */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedProducts.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1 text-xs bg-brand/8 text-brand border border-brand/15 rounded-full px-2.5 py-1">
                      {p.name}
                      <button type="button" onClick={() => toggleProduct(p.id)} className="hover:text-danger">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProductPickerOpen((o) => !o)}
                  className="w-full h-9 px-3 rounded-md border border-neutral-200 text-sm text-neutral-500 flex items-center justify-between hover:border-neutral-300 transition-colors bg-white"
                >
                  <span>Agregar producto...</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', productPickerOpen && 'rotate-180')} />
                </button>

                {productPickerOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 border border-neutral-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                    {productsLoading ? (
                      <div className="p-3 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                      </div>
                    ) : products.length === 0 ? (
                      <p className="text-sm text-neutral-400 text-center py-4">Sin productos disponibles</p>
                    ) : (
                      products.map((p) => {
                        const selected = selectedProductIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProduct(p.id)}
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors',
                              selected && 'text-brand',
                            )}
                          >
                            <span className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', selected ? 'bg-brand border-brand' : 'border-neutral-300')}>
                              {selected && <Check className="h-2.5 w-2.5 text-white" />}
                            </span>
                            <span className="truncate">{p.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 gap-2 border-t border-neutral-200 shrink-0 bg-white sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand text-brand-foreground hover:bg-brand-hover min-w-[140px]">
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear kit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
