import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Plus, Trash2, Upload, X, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_OPTIONS, type AdminProduct, type VariantRow } from '@/types/admin';
import type { Category } from '@/types/shop';

// Lightweight unique key for variant rows
const uid = () => Math.random().toString(36).slice(2, 9);

const emptyVariant = (): VariantRow => ({
  _key: uid(),
  color: '',
  size: '',
  stock: '',
  price_adjustment: '',
});

interface FormFields {
  name: string;
  description: string;
  category: Category | '';
  brand: string;
  price: string;
  stock: string;
}

const BLANK: FormFields = {
  name: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  stock: '',
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: AdminProduct | null;
  isSubmitting: boolean;
  onSubmit: (form: FormData, id?: string) => Promise<void>;
}

export function ProductFormModal({ open, onOpenChange, product, isSubmitting, onSubmit }: Props) {
  const [fields, setFields] = useState<FormFields>(BLANK);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Populate / reset when modal opens or product changes
  useEffect(() => {
    if (!open) {
      setFields(BLANK);
      setVariants([]);
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
      return;
    }
    if (product) {
      setFields({
        name: product.name,
        description: product.description ?? '',
        category: product.category,
        brand: product.brand ?? '',
        price: String(product.base_price),
        stock: String(product.stock),
      });
      setVariants(
        (product.variants ?? []).map((v) => ({
          _key: uid(),
          color: v.color,
          size: v.size,
          stock: String(v.stock),
          price_adjustment: String(v.price_adjustment),
        })),
      );
      setImagePreview(product.images?.[0] ?? null);
    }
  }, [open, product]);

  // Revoke object URL when the file selection changes to avoid memory leaks
  useEffect(() => {
    if (!imageFile) return;
    return () => URL.revokeObjectURL(imagePreview ?? '');
  }, [imageFile]);

  const upd =
    (k: keyof FormFields) =>
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

  const addVariant = () => setVariants((v) => [...v, emptyVariant()]);

  const removeVariant = (key: string) =>
    setVariants((v) => v.filter((r) => r._key !== key));

  const updVariant =
    (key: string, field: keyof Omit<VariantRow, '_key'>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setVariants((v) =>
        v.map((r) => (r._key === key ? { ...r, [field]: e.target.value } : r)),
      );

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormFields, string>> = {};
    if (!fields.name.trim()) e.name = 'El nombre es requerido';
    if (!fields.category) e.category = 'Seleccioná una categoría';
    if (!fields.price || isNaN(Number(fields.price)) || Number(fields.price) < 0)
      e.price = 'Precio inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();
    fd.append('name', fields.name.trim());
    fd.append('description', fields.description.trim());
    fd.append('category', fields.category);
    fd.append('brand', fields.brand.trim());
    fd.append('base_price', fields.price);
    fd.append('stock', fields.stock || '0');

    const parsedVariants = variants.map((v) => ({
      color: v.color.trim(),
      size: v.size.trim(),
      stock: parseInt(v.stock, 10) || 0,
      price_adjustment: parseFloat(v.price_adjustment) || 0,
    }));
    fd.append('variants', JSON.stringify(parsedVariants));

    if (imageFile) {
      fd.append('image', imageFile);
    }

    await onSubmit(fd, product?.id);
  };

  const isEdit = !!product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="font-display text-xl">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* ── LEFT COLUMN: Core info + image ── */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Información básica
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="pf-name">Nombre *</Label>
                <Input
                  id="pf-name"
                  value={fields.name}
                  onChange={upd('name')}
                  placeholder="Ej: Luminaria LED 12W RGB"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pf-desc">Descripción</Label>
                <Textarea
                  id="pf-desc"
                  rows={3}
                  value={fields.description}
                  onChange={upd('description')}
                  placeholder="Descripción breve del producto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoría *</Label>
                  <Select
                    value={fields.category}
                    onValueChange={(v) =>
                      setFields((f) => ({ ...f, category: v as Category }))
                    }
                  >
                    <SelectTrigger aria-invalid={!!errors.category}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pf-brand">Marca</Label>
                  <Input
                    id="pf-brand"
                    value={fields.brand}
                    onChange={upd('brand')}
                    placeholder="AquaLed..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pf-price">Precio base (ARS) *</Label>
                  <Input
                    id="pf-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={fields.price}
                    onChange={upd('price')}
                    placeholder="0.00"
                    aria-invalid={!!errors.price}
                  />
                  {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pf-stock">Stock</Label>
                  <Input
                    id="pf-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={fields.stock}
                    onChange={upd('stock')}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <Label>Imagen del producto</Label>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {imagePreview ? (
                  <div className="relative group rounded-lg overflow-hidden border bg-muted aspect-video">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-sm"
                      aria-label="Quitar imagen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-sm"
                    >
                      <Upload className="h-3 w-3" /> Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-secondary/60 hover:bg-muted/30 transition-all"
                  >
                    <ImageIcon className="h-8 w-8 opacity-40" />
                    <span className="text-sm font-medium">Subir imagen</span>
                    <span className="text-xs opacity-60">JPG, PNG o WebP · máx. 5 MB</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Variants ── */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Variantes / Características
                </p>
                <Badge variant="outline" className="text-xs font-normal">
                  {variants.length} {variants.length === 1 ? 'variante' : 'variantes'}
                </Badge>
              </div>

              {variants.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg py-10 px-4 text-center text-muted-foreground">
                  <p className="text-sm font-medium">Sin variantes configuradas</p>
                  <p className="text-xs mt-1 opacity-70">
                    El stock y precio base se usan directamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 -mr-1">
                  {variants.map((v, idx) => (
                    <div
                      key={v._key}
                      className="border rounded-lg p-3 space-y-2.5 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Variante {idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeVariant(v._key)}
                          aria-label="Eliminar variante"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Color</Label>
                          <Input
                            className="h-8 text-sm"
                            placeholder="Azul marino"
                            value={v.color}
                            onChange={updVariant(v._key, 'color')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Talle / Tamaño</Label>
                          <Input
                            className="h-8 text-sm"
                            placeholder="Grande / XL"
                            value={v.size}
                            onChange={updVariant(v._key, 'size')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Stock</Label>
                          <Input
                            className="h-8 text-sm"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={v.stock}
                            onChange={updVariant(v._key, 'stock')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Ajuste de precio</Label>
                          <Input
                            className="h-8 text-sm"
                            type="number"
                            step="0.01"
                            placeholder="+500"
                            value={v.price_adjustment}
                            onChange={updVariant(v._key, 'price_adjustment')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
                className="w-full"
              >
                <Plus className="h-4 w-4" />
                Agregar variante
              </Button>
            </div>
          </div>

          <Separator />

          <DialogFooter className="px-6 py-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-aqua text-primary-foreground min-w-[160px]"
            >
              {isSubmitting
                ? 'Guardando...'
                : isEdit
                ? 'Guardar cambios'
                : 'Crear producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
