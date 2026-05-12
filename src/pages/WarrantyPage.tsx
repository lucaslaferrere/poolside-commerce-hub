import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, XCircle, Shield, MessageCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Footer } from '@/components/site/Footer';
import { buildWhatsAppLink, BUSINESS_NAME } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface FormState {
  serial: string;
  model: string;
  problem_desc: string;
  invoice: string;
  purchase_date: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

const BLANK: FormState = {
  serial: '', model: '', problem_desc: '',
  invoice: '', purchase_date: '',
  name: '', email: '', phone: '', message: '',
};

const MODELS = ['OSIRE', 'HORUS', 'NAZAR', 'POOLIGHT', 'Controlador'];

export default function WarrantyPage() {
  const [form, setForm] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const upd = (k: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.serial.trim())        e.serial        = 'Requerido';
    if (!form.model)                e.model         = 'Requerido';
    if (!form.problem_desc.trim())  e.problem_desc  = 'Requerido';
    if (!form.invoice.trim())       e.invoice       = 'Requerido';
    if (!form.purchase_date)        e.purchase_date = 'Requerido';
    if (!form.name.trim())          e.name          = 'Requerido';
    if (!form.email.trim())         e.email         = 'Requerido';
    if (!form.phone.trim())         e.phone         = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const msg = [
      `🛡️ *SOLICITUD DE GARANTÍA — ${BUSINESS_NAME}*`,
      '',
      `*Producto*`,
      `• Serie: ${form.serial}`,
      `• Modelo: ${form.model}`,
      `• Problema: ${form.problem_desc}`,
      '',
      `*Compra*`,
      `• Factura/Comprobante: ${form.invoice}`,
      `• Fecha de compra: ${form.purchase_date}`,
      '',
      `*Datos de contacto*`,
      `• Nombre: ${form.name}`,
      `• Email: ${form.email}`,
      `• Teléfono: ${form.phone}`,
      ...(form.message ? ['', `*Mensaje adicional*`, form.message] : []),
      '',
      `⚠️ Adjuntá foto del producto y video del problema en este chat.`,
    ].join('\n');

    window.open(buildWhatsAppLink(msg), '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16">


        <div className="container max-w-3xl py-10 pb-20 space-y-10">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mx-auto">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">Garantía Pooled</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Procesamos tu solicitud en 48 horas hábiles.
            </p>
          </div>

          {/* Alert — solo compras directas */}
          <div className="flex gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="text-sm space-y-0.5">
              <p className="font-semibold">Solo para compras directas en www.pooled.com.ar</p>
              <p className="text-amber-700">Si compraste a través de un distribuidor, contactá primero con él para gestionar la garantía.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Datos del producto */}
            <section className="space-y-4">
              <h2 className="font-display font-semibold text-lg text-primary border-b pb-2">Datos del producto</h2>

              <Field label="Número de serie *" error={errors.serial}>
                <Input value={form.serial} onChange={upd('serial')} placeholder="Ej: OSR-2024-001234" className={cn(errors.serial && 'border-destructive')} />
              </Field>

              <Field label="Modelo / Línea *" error={errors.model}>
                <Select value={form.model} onValueChange={(v) => { setForm((f) => ({ ...f, model: v })); setErrors((e) => ({ ...e, model: undefined })); }}>
                  <SelectTrigger className={cn(errors.model && 'border-destructive')}>
                    <SelectValue placeholder="Seleccioná el modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Descripción del problema *" error={errors.problem_desc}>
                <Textarea
                  value={form.problem_desc}
                  onChange={upd('problem_desc')}
                  placeholder="Describí el defecto observado..."
                  rows={3}
                  className={cn(errors.problem_desc && 'border-destructive')}
                />
              </Field>

              <div className="flex gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50 text-blue-800 text-xs">
                <MessageCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Adjuntá la <strong>foto del producto</strong> y el <strong>video del problema</strong> directamente en el chat de WhatsApp que se abre al enviar este formulario.</p>
              </div>
            </section>

            {/* Datos de compra */}
            <section className="space-y-4">
              <h2 className="font-display font-semibold text-lg text-primary border-b pb-2">Datos de compra</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nº de factura / Comprobante *" error={errors.invoice}>
                  <Input value={form.invoice} onChange={upd('invoice')} placeholder="Ej: 0001-00004521" className={cn(errors.invoice && 'border-destructive')} />
                </Field>
                <Field label="Fecha de compra *" error={errors.purchase_date}>
                  <Input type="date" value={form.purchase_date} onChange={upd('purchase_date')} className={cn(errors.purchase_date && 'border-destructive')} />
                </Field>
              </div>
            </section>

            {/* Tus datos */}
            <section className="space-y-4">
              <h2 className="font-display font-semibold text-lg text-primary border-b pb-2">Tus datos</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre completo *" error={errors.name}>
                  <Input value={form.name} onChange={upd('name')} placeholder="Juan García" className={cn(errors.name && 'border-destructive')} />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <Input type="email" value={form.email} onChange={upd('email')} placeholder="juan@email.com" className={cn(errors.email && 'border-destructive')} />
                </Field>
                <Field label="Teléfono *" error={errors.phone}>
                  <Input type="tel" value={form.phone} onChange={upd('phone')} placeholder="+54 9 11 ..." className={cn(errors.phone && 'border-destructive')} />
                </Field>
              </div>
              <Field label="Mensaje adicional" hint="máx. 500 caracteres">
                <Textarea
                  value={form.message}
                  onChange={upd('message')}
                  maxLength={500}
                  placeholder="Cualquier detalle extra que quieras agregar..."
                  rows={3}
                />
              </Field>
            </section>

            <Button type="submit" size="lg" className="w-full gradient-aqua text-primary-foreground gap-2">
              <MessageCircle className="h-5 w-5" />
              Enviar solicitud por WhatsApp
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Tiempo de respuesta: <strong>48 horas hábiles</strong>
            </p>
          </form>

          {/* Cobertura */}
          <section className="space-y-4">
            <h2 className="font-display font-semibold text-xl text-primary">Cobertura de garantía</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { period: '1 año (12 meses)', products: 'Controladores, HORUS, NAZAR, POOLIGHT' },
                { period: '3 años', products: 'OSIRE — línea premium' },
              ].map((c) => (
                <div key={c.period} className="flex gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm">{c.period}</p>
                    <p className="text-xs text-emerald-700 mt-0.5">{c.products}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground px-1">Aplica exclusivamente a defectos de fabricación desde la fecha de facturación.</p>
          </section>

          {/* Exclusiones */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-display font-semibold text-xl text-primary">La garantía NO cubre</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                'Mala instalación, manipulación por terceros no autorizados, variaciones de tensión o descargas eléctricas.',
                'Encender equipos fuera del agua (daño electrónico permanente e instantáneo).',
                'Cortar el cable original de la luminaria (anula la estanqueidad).',
                'Usar pegamentos, siliconas o selladores en el alojamiento (bloquea la disipación térmica).',
                'Electrocorrosión por falta de descarga a tierra en otros equipos o por conectar a marcas de terceros.',
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* CTA final */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="outline" className="flex-1 gap-2">
              <a href="#guia" onClick={() => window.scrollTo(0,0)}>
                Asesoría técnica
              </a>
            </Button>
            <Button asChild className="flex-1 gradient-aqua text-primary-foreground gap-2">
              <a href={buildWhatsAppLink(`Hola ${BUSINESS_NAME}! Tengo una consulta sobre garantía.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>

        </div>
        <Footer />
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-sm">{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
