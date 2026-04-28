import { useState } from 'react';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Droplet, UserPlus } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { useAuth, type User } from '@/context/AuthContext';
import { toast } from 'sonner';

interface RegisterResponse {
  token: string;
  user: User;
}

const schema = z
  .object({
    email: z.string().trim().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState<FormData>({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const upd = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormData, string>> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as keyof FormData] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      const res = await apiPost<RegisterResponse>('/auth/register', {
        email: parsed.data.email,
        password: parsed.data.password,
      });
      setSession(res.token, res.user);
      toast.success('¡Cuenta creada!', { description: 'Bienvenido/a a AquaLed.' });
      navigate('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-xl">
            <span className="grid place-items-center h-10 w-10 rounded-full gradient-aqua text-primary-foreground shadow-aqua">
              <Droplet className="h-5 w-5" fill="currentColor" />
            </span>
            AquaLed
          </Link>
          <h1 className="font-display text-2xl font-bold mt-4">Crear cuenta</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registrate para acceder a tu historial de pedidos
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={upd('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={upd('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm">Repetir contraseña</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={upd('confirmPassword')}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-aqua text-primary-foreground"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/" className="text-secondary font-medium hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
