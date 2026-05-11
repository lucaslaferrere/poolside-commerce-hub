import { useState, useEffect, type ChangeEvent } from 'react';
import { Plus, Trash2, X, ImageIcon, AlertCircle, Link2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  CATEGORY_OPTIONS,
  type AdminProduct,
  type VariantRow,
  type SpecRow,
} from '@/types/admin';
import type { Category } from '@/types/shop';
import { cn } from '@/lib/utils';

const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Locale-tolerant number coercion.
 * - Swaps the decimal comma for a dot (es-AR users frequently type "12,5").
 * - Empty / null / NaN inputs default to 0 — never sent as null or "" to a
 *   numeric property of the backend payload.
 */
function toFloat(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  const cleaned = String(raw).replace(',', '.').trim();
  if (!cleaned) return 0;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toInt(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  const cleaned = String(raw).replace(',', '.').trim();
  if (!cleaned) return 0;
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

const emptyVariant = (): VariantRow => ({
  _key: uid(),
  color: '',
  size: '',
  stock: '',
  price_adjustment: '',
});

const emptySpec = (): SpecRow => ({
  _key: uid(),
  key: '',
  value: '',
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

export function ProductFormModal({
  open,
  onOpenChange,
  product,
  isSubmitting,
  onSubmit,
}: Props) {
  const [fields, setFields] = useState<FormFields>(BLANK);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFields(BLANK);
      setVariants([]);
      setSpecs([]);
      setImageUrls([]);
      setUrlInput('');
      setErrors({});
      setSubmitError(null);
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
      setSpecs(
        (product.specs ?? []).map((s) => ({
          _key: uid(),
          key: s.key,
          value: s.value,
        })),
      );
      setImageUrls(product.images ?? []);
    }
  }, [open, product]);

  const upd =
    (k: keyof FormFields) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));

  const addImageUrl = () => {
    const url = urlInput.trim();
    if (!url || imageUrls.includes(url)) return;
    setImageUrls((prev) => [...prev, url]);
    setUrlInput('');
  };

  const removeImageUrl = (url: string) =>
    setImageUrls((prev) => prev.filter((u) => u !== url));

  // Variants
  const addVariant = () => setVariants((v) => [...v, emptyVariant()]);
  const removeVariant = (key: string) =>
    setVariants((v) => v.filter((r) => r._key !== key));
  const updVariant =
    (key: string, field: keyof Omit<VariantRow, '_key'>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setVariants((v) =>
        v.map((r) => (r._key === key ? { ...r, [field]: e.target.value } : r)),
      );

  // Specs (Ficha técnica)
  const addSpec = () => setSpecs((s) => [...s, emptySpec()]);
  const removeSpec = (key: string) =>
    setSpecs((s) => s.filter((r) => r._key !== key));
  const updSpec =
    (key: string, field: keyof Omit<SpecRow, '_key'>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setSpecs((s) =>
        s.map((r) => (r._key === key ? { ...r, [field]: e.target.value } : r)),
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
    setSubmitError(null);

    // ─── Numeric sanitization ────────────────────────────────────────────
    // Every numeric field passes through toFloat/toInt:
    //   1. comma → dot (so "12,5" parses cleanly)
    //   2. empty / NaN → 0 (never null, NaN, or "")
    //   3. result is a real JS Number, so JSON.stringify emits a numeric
    //      literal (e.g. 12.5) — not a quoted string.
    const basePrice = Math.max(0, toFloat(fields.price));
    const stockNum = Math.max(0, toInt(fields.stock));

    // Variants — drop rows w/o identity (no color AND no size). Numeric
    // fields are real numbers inside the JSON payload, not strings.
    const parsedVariants = variants
      .map((v) => ({
        color: v.color.trim(),
        size: v.size.trim(),
        stock: Math.max(0, toInt(v.stock)),
        price_adjustment: toFloat(v.price_adjustment),
      }))
      .filter((v) => v.color.length > 0 || v.size.length > 0);

    // Specs — backend contract: [{ key, value }]. Require BOTH non-empty.
    const parsedSpecs = specs
      .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
      .filter((s) => s.key.length > 0 && s.value.length > 0);

    const fd = new FormData();
    fd.append('name', fields.name.trim());
    fd.append('description', fields.description.trim());
    fd.append('category', fields.category);
    fd.append('brand', fields.brand.trim());
    // String() on a JS Number gives "12.5" — canonical, dot-decimal, parser-safe.
    fd.append('base_price', String(basePrice));
    fd.append('stock', String(stockNum));
    fd.append('variants', JSON.stringify(parsedVariants));
    fd.append('specs', JSON.stringify(parsedSpecs));
    fd.append('images', JSON.stringify(imageUrls));

    try {
      await onSubmit(fd, product?.id);
      // Parent closes the modal on success; nothing else to do here.
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Error desconocido';
      setSubmitError(detail);
      // Bring the alert into view if the user has scrolled.
      requestAnimationFrame(() => {
        document
          .getElementById('product-form-alert')
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  };

  const isEdit = !!product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Sizing — fully responsive with safe edge margins
          'w-[95vw] max-w-6xl max-h-[88vh]',
          // Reset shadcn defaults so we control the inner layout
          'p-0 gap-0 overflow-hidden flex flex-col',
        )}
      >
        <DialogHeader className="px-6 py-5 border-b border-neutral-200 shrink-0">
          <DialogTitle className="font-display text-xl font-semibold text-neutral-900">
            {isEdit ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <p className="text-xs text-neutral-500 mt-1">
            Información básica, variantes y ficha técnica del producto.
          </p>
        </DialogHeader>

        {/* Scrolling body — header & footer stay pinned */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
          noValidate
        >
          <div className="flex-1 overflow-y-auto">
            {submitError && (
              <div
                id="product-form-alert"
                role="alert"
                className="mx-6 mt-5 px-4 py-3 rounded-lg border border-danger/30 bg-danger/5 flex items-start gap-3"
              >
                <AlertCircle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-medium text-neutral-900">
                    No se pudo guardar el producto
                  </p>
                  <p className="text-xs text-neutral-700 mt-0.5 leading-relaxed">
                    Revisá los campos.{' '}
                    <span className="text-neutral-900">Detalle:</span>{' '}
                    <span className="text-danger break-words">{submitError}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 -mt-0.5"
                  aria-label="Cerrar alerta"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* ──────────────────────────────────────────────────── */}
              {/*  Column 1 · Información básica                      */}
              {/* ──────────────────────────────────────────────────── */}
              <section className="px-6 py-6 space-y-4">
                <SectionLabel>Información básica</SectionLabel>

                <Field
                  id="pf-name"
                  label="Nombre"
                  required
                  error={errors.name}
                  value={fields.name}
                  onChange={upd('name')}
                  placeholder="Ej: Luminaria LED 12W RGB"
                />

                <div className="space-y-1.5">
                  <Label htmlFor="pf-desc" className="text-xs font-medium text-neutral-700">
                    Descripción
                  </Label>
                  <Textarea
                    id="pf-desc"
                    rows={3}
                    value={fields.description}
                    onChange={upd('description')}
                    placeholder="Descripción breve del producto..."
                    className="resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-neutral-700">
                      Categoría <span className="text-danger">*</span>
                    </Label>
                    <Select
                      value={fields.category}
                      onValueChange={(v) =>
                        setFields((f) => ({ ...f, category: v as Category }))
                      }
                    >
                      <SelectTrigger
                        aria-invalid={!!errors.category}
                        className={cn(errors.category && 'border-danger')}
                      >
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
                      <p className="text-xs text-danger">{errors.category}</p>
                    )}
                  </div>

                  <Field
                    id="pf-brand"
                    label="Marca"
                    value={fields.brand}
                    onChange={upd('brand')}
                    placeholder="Pooled..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="pf-price"
                    label="Precio base (ARS)"
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    error={errors.price}
                    value={fields.price}
                    onChange={upd('price')}
                    placeholder="0.00"
                  />
                  <Field
                    id="pf-stock"
                    label="Stock"
                    type="number"
                    min="0"
                    step="1"
                    value={fields.stock}
                    onChange={upd('stock')}
                    placeholder="0"
                  />
                </div>

                {/* Image URLs */}
                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-medium text-neutral-700">
                    Imágenes ({imageUrls.length})
                  </Label>

                  {/* URL input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <Input
                        placeholder="https://pub-....r2.dev/imagen.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                        className="pl-8 text-xs h-9"
                      />
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addImageUrl} className="h-9 px-3 shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Thumbnails grid */}
                  {imageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {imageUrls.map((url, i) => (
                        <div key={url} className="relative group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square">
                          <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded">Principal</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImageUrl(url)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                            aria-label="Quitar imagen"
                          >
                            <X className="h-3 w-3 text-neutral-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-24 border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center gap-1 text-neutral-400">
                      <ImageIcon className="h-5 w-5 opacity-50" />
                      <span className="text-xs">Pegá URLs de Cloudflare R2</span>
                    </div>
                  )}
                </div>
              </section>

              {/* ──────────────────────────────────────────────────── */}
              {/*  Column 2 · Variantes                                */}
              {/* ──────────────────────────────────────────────────── */}
              <section className="px-6 py-6 space-y-4 border-t md:border-t-0 md:border-l border-neutral-200">
                <div className="flex items-center justify-between">
                  <SectionLabel>Variantes</SectionLabel>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium tracking-wide border-neutral-200 text-neutral-500"
                  >
                    {variants.length} {variants.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>

                {variants.length === 0 ? (
                  <EmptyState
                    title="Sin variantes configuradas"
                    description="El stock y precio base se usan directamente."
                  />
                ) : (
                  <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1 -mr-1">
                    {variants.map((v, idx) => (
                      <li
                        key={v._key}
                        className="border border-neutral-200 rounded-lg p-3 space-y-2.5 bg-neutral-50/60 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
                            Variante {idx + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-neutral-400 hover:text-danger hover:bg-danger/10"
                            onClick={() => removeVariant(v._key)}
                            aria-label={`Eliminar variante ${idx + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <CompactField
                            label="Color"
                            placeholder="Azul marino"
                            value={v.color}
                            onChange={updVariant(v._key, 'color')}
                          />
                          <CompactField
                            label="Talle / Tamaño"
                            placeholder="XL"
                            value={v.size}
                            onChange={updVariant(v._key, 'size')}
                          />
                          <CompactField
                            label="Stock"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={v.stock}
                            onChange={updVariant(v._key, 'stock')}
                          />
                          <CompactField
                            label="Ajuste de precio"
                            type="number"
                            step="0.01"
                            placeholder="+500"
                            value={v.price_adjustment}
                            onChange={updVariant(v._key, 'price_adjustment')}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <BrandAddButton onClick={addVariant} label="Agregar variante" />
              </section>

              {/* ──────────────────────────────────────────────────── */}
              {/*  Column 3 · Ficha técnica                            */}
              {/* ──────────────────────────────────────────────────── */}
              <section
                className={cn(
                  'px-6 py-6 space-y-4',
                  'border-t md:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l border-neutral-200',
                )}
              >
                <div className="flex items-center justify-between">
                  <SectionLabel>Ficha técnica</SectionLabel>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium tracking-wide border-neutral-200 text-neutral-500"
                  >
                    {specs.length} {specs.length === 1 ? 'fila' : 'filas'}
                  </Badge>
                </div>

                {specs.length === 0 ? (
                  <EmptyState
                    title="Sin especificaciones cargadas"
                    description="Agregá pares como Potencia / 12 W o Material / Acero inoxidable."
                  />
                ) : (
                  <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1 -mr-1">
                    {/* Header — only on lg where the column has room */}
                    <li className="hidden lg:grid grid-cols-[1fr_1fr_2.25rem] gap-2 px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                        Propiedad
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                        Valor
                      </span>
                      <span />
                    </li>

                    {specs.map((s, idx) => (
                      <li
                        key={s._key}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2.25rem] gap-2 items-start"
                      >
                        <Input
                          aria-label={`Propiedad ${idx + 1}`}
                          className="h-9 text-sm"
                          placeholder="Ej: Potencia"
                          value={s.key}
                          onChange={updSpec(s._key, 'key')}
                        />
                        <div className="flex gap-2">
                          <Input
                            aria-label={`Valor ${idx + 1}`}
                            className="h-9 text-sm flex-1"
                            placeholder="Ej: 12 W"
                            value={s.value}
                            onChange={updSpec(s._key, 'value')}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 text-neutral-400 hover:text-danger hover:bg-danger/10 sm:hidden"
                            onClick={() => removeSpec(s._key)}
                            aria-label={`Eliminar fila ${idx + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-neutral-400 hover:text-danger hover:bg-danger/10 hidden sm:inline-flex"
                          onClick={() => removeSpec(s._key)}
                          aria-label={`Eliminar fila ${idx + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}

                <BrandAddButton onClick={addSpec} label="Agregar fila" />
              </section>
            </div>
          </div>

          {/* Sticky footer */}
          <DialogFooter className="px-6 py-4 gap-2 border-t border-neutral-200 shrink-0 bg-white sm:justify-end">
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
              className="bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active min-w-[160px] shadow-none"
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

/* ──────────────────────────────────────────────────────────────────────
   Small reusable bits
   ────────────────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.14em]">
      {children}
    </p>
  );
}

interface FieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
}

function Field({ id, label, required, error, className, ...rest }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-neutral-700">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        className={cn(error && 'border-danger focus-visible:ring-danger/30', className)}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

interface CompactFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string;
}

function CompactField({ label, className, ...rest }: CompactFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-neutral-500">{label}</Label>
      <Input className={cn('h-8 text-sm', className)} {...rest} />
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-dashed border-neutral-300 rounded-lg py-8 px-4 text-center bg-neutral-50/40">
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
    </div>
  );
}

/**
 * Brand-tinted "+" button used for "Agregar variante" / "Agregar fila".
 * Soft brand surface to read as a primary action without competing visually
 * with the main "Crear producto" CTA in the footer.
 */
function BrandAddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      size="sm"
      variant="ghost"
      className={cn(
        'w-full h-9 text-sm font-medium',
        'bg-brand/8 text-brand border border-brand/15',
        'hover:bg-brand/12 hover:text-brand-hover hover:border-brand/25',
        'active:bg-brand/15',
      )}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}
