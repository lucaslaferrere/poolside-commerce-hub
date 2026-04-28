import { useState } from 'react';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFieldErrors({});
    setServerError('');
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: { email?: string; password?: string } = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as 'email' | 'password'] = i.message;
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setServerError('');
    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Iniciar sesión</DialogTitle>
          <DialogDescription>Ingresá con tu email y contraseña.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Contraseña</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!fieldErrors.password}
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
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
            <LogIn className="h-4 w-4" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground pt-1">
          ¿No tenés cuenta?{' '}
          <Link
            to="/register"
            onClick={() => onOpenChange(false)}
            className="text-secondary font-medium hover:underline"
          >
            Registrate
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
