import { useState } from 'react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Tab = 'login' | 'register';

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z
  .object({
    email: z.string().trim().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const BUBBLES = [
  { id: 0, size: 10, left: 8,  duration: 5,   delay: 0   },
  { id: 1, size: 18, left: 22, duration: 7,   delay: 1.2 },
  { id: 2, size: 8,  left: 40, duration: 4.5, delay: 0.5 },
  { id: 3, size: 14, left: 58, duration: 6,   delay: 2   },
  { id: 4, size: 20, left: 72, duration: 8,   delay: 0.8 },
  { id: 5, size: 9,  left: 85, duration: 5.5, delay: 1.7 },
  { id: 6, size: 12, left: 93, duration: 6.5, delay: 3   },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: Tab;
  onSuccess?: () => void;
}

export function LoginModal({ open, onOpenChange, defaultTab = 'login', onSuccess }: Props) {
  const { login } = useAuth();

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setShowPassword(false); setShowConfirm(false);
    setFieldErrors({}); setServerError(''); setLoading(false);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) { reset(); setTab(defaultTab); }
    onOpenChange(v);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setFieldErrors({});
    setServerError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tab === 'login') {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
        setFieldErrors(errs);
        return;
      }
      setFieldErrors({}); setServerError(''); setLoading(true);
      try {
        await login(parsed.data.email, parsed.data.password);
        toast.success('¡Bienvenido de vuelta!');
        reset(); onOpenChange(false); onSuccess?.();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Credenciales inválidas');
      } finally {
        setLoading(false);
      }
    } else {
      const parsed = registerSchema.safeParse({ email, password, confirmPassword });
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
        setFieldErrors(errs);
        return;
      }
      setFieldErrors({}); setServerError(''); setLoading(true);
      try {
        await apiPost('/auth/register', { email: parsed.data.email, password: parsed.data.password });
        await login(parsed.data.email, parsed.data.password);
        toast.success('¡Cuenta creada!', { description: 'Ya estás dentro.' });
        reset(); onOpenChange(false); onSuccess?.();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 gap-0 [&>button:last-child]:text-white [&>button:last-child]:top-4 [&>button:last-child]:right-4">
        <DialogTitle className="sr-only">
          {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </DialogTitle>

        {/* Branded header */}
        <div className="relative h-56 gradient-deep overflow-hidden">
          {BUBBLES.map((b) => (
            <motion.div
              key={b.id}
              className="absolute bottom-0 rounded-full bg-white/20 border border-white/30"
              style={{ width: b.size, height: b.size, left: `${b.left}%` }}
              animate={{ y: [-b.size, -160], opacity: [0, 0.7, 0] }}
              transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 400 30" preserveAspectRatio="none" style={{ height: 30 }}>
            <path
              d="M0,15 C50,30 100,0 150,15 C200,30 250,0 300,15 C350,30 400,0 400,15 L400,30 L0,30 Z"
              fill="hsl(var(--background))"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2 pb-4">
            <img src="/Pooled blanco.svg" alt="Pooled" className="h-[200px]" />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-3">
          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1 mb-5">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                  tab === t
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'login'
                  ? <><LogIn className="h-3.5 w-3.5" /> Ingresar</>
                  : <><UserPlus className="h-3.5 w-3.5" /> Registrarse</>
                }
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onSubmit={submit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="lm-email">Email</Label>
                <Input
                  id="lm-email"
                  type="email"
                  autoComplete="email"
                  placeholder="vos@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lm-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="lm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    placeholder={tab === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!fieldErrors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              </div>

              <AnimatePresence>
                {tab === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <Label htmlFor="lm-confirm">Repetir contraseña</Label>
                    <div className="relative">
                      <Input
                        id="lm-confirm"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={!!fieldErrors.confirmPassword}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {serverError && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full gradient-aqua text-primary-foreground hover:opacity-90"
              >
                {loading
                  ? 'Un momento...'
                  : tab === 'login' ? 'Ingresar' : 'Crear cuenta'
                }
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
