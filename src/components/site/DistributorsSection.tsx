import { useState } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Handshake, Send, CheckCircle2 } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

const schema = z.object({
  full_name: z.string().trim().min(2, 'Nombre muy corto').max(200),
  company: z.string().trim().min(2, 'Empresa requerida').max(200),
  city: z.string().trim().min(2, 'Ciudad requerida').max(100),
  phone: z.string().trim().min(6, 'Teléfono inválido').max(30),
  email: z.string().trim().email('Email inválido').max(255),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
});

type Form = z.infer<typeof schema>;

export function DistributorsSection() {
  const [form, setForm] = useState<Form>({ full_name: '', company: '', city: '', phone: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const upd = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Form, string>> = {};
      parsed.error.issues.forEach((iss) => {
        const key = iss.path[0] as keyof Form;
        errs[key] = iss.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await apiPost('/distributor-leads', {
        full_name: parsed.data.full_name,
        company: parsed.data.company,
        city: parsed.data.city,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message || undefined,
      });
      setSuccess(true);
      toast.success('¡Recibido!', { description: 'Te contactamos en menos de 24hs.' });
      setForm({ full_name: '', company: '', city: '', phone: '', email: '', message: '' });
    } catch (err) {
      toast.error('No pudimos enviar el formulario', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="distribuidores" className="py-16 md:py-24 gradient-deep text-primary-foreground">
      <div className="container grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium mb-4">
            <Handshake className="h-3 w-3 text-secondary" />
            Programa B2B
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight text-balance">
            ¿Sos instalador o tenés tienda?
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg text-balance">
            Sumate a nuestra red de distribuidores y obtené precios mayoristas, soporte técnico y entregas prioritarias.
          </p>
          <ul className="mt-6 space-y-2 text-primary-foreground/90">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> Hasta 35% de descuento</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> Capacitaciones técnicas</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-secondary" /> Material POP gratis</li>
          </ul>
        </motion.div>

        <Card className="p-6 md:p-8 text-foreground">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-14 w-14 text-secondary mx-auto mb-3" />
              <h3 className="font-display text-2xl font-bold">¡Gracias!</h3>
              <p className="text-muted-foreground mt-2">Recibimos tus datos. Te contactamos en menos de 24hs.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
                Enviar otra solicitud
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="font-display text-xl font-bold mb-2">Quiero ser distribuidor</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Nombre completo" id="full_name" value={form.full_name} onChange={upd('full_name')} error={errors.full_name} />
                <Field label="Empresa" id="company" value={form.company} onChange={upd('company')} error={errors.company} />
                <Field label="Ciudad" id="city" value={form.city} onChange={upd('city')} error={errors.city} />
                <Field label="Teléfono" id="phone" type="tel" value={form.phone} onChange={upd('phone')} error={errors.phone} />
              </div>
              <Field label="Email" id="email" type="email" value={form.email} onChange={upd('email')} error={errors.email} />
              <div className="space-y-1.5">
                <Label htmlFor="message">Contanos sobre tu negocio (opcional)</Label>
                <Textarea id="message" rows={3} value={form.message} onChange={upd('message')} />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" disabled={loading} size="lg" className="w-full gradient-aqua text-primary-foreground">
                <Send className="h-4 w-4" />
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}

function Field({
  label, id, type = 'text', value, onChange, error,
}: {
  label: string; id: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} aria-invalid={!!error} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
