import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 'forgot' | 'verify';

const emailSchema = z.object({
  email: z.string().trim().email('Email inválido'),
});

const resetSchema = z
  .object({
    code: z
      .string()
      .length(6, 'El código debe tener 6 dígitos')
      .regex(/^\d+$/, 'Solo números'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('forgot');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({}); setServerError(''); setLoading(true);
    try {
      await apiPost('/auth/forgot-password', { email: parsed.data.email });
      setResendCooldown(60);
      setStep('verify');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ocurrió un error, intentá de nuevo');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      await apiPost('/auth/forgot-password', { email });
      setResendCooldown(60);
      toast.success('Código reenviado', { description: 'Revisá tu casilla de correo.' });
    } catch {
      toast.error('No se pudo reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetSchema.safeParse({ code, newPassword, confirmPassword });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({}); setServerError(''); setLoading(true);
    try {
      await apiPost('/auth/reset-password', {
        email,
        code: parsed.data.code,
        new_password: parsed.data.newPassword,
      });
      toast.success('¡Contraseña actualizada!', {
        description: 'Ya podés iniciar sesión con tu nueva contraseña.',
      });
      navigate('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ocurrió un error, intentá de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md pt-24 pb-12">

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            step === 'forgot' ? 'w-8 bg-cyan-500' : 'w-4 bg-cyan-500/40',
          )} />
          <div className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            step === 'verify' ? 'w-8 bg-cyan-500' : 'w-4 bg-muted',
          )} />
        </div>

        <AnimatePresence mode="wait">
          {step === 'forgot' ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">Recuperar contraseña</h1>
              <p className="text-muted-foreground mb-8">
                Ingresá tu email y te enviamos un código de verificación de 6 dígitos.
              </p>

              <form onSubmit={handleForgot} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fp-email">Email</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="vos@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!fieldErrors.email}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

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
                  {loading ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">Nueva contraseña</h1>
              <p className="text-muted-foreground mb-8">
                Ingresá el código enviado a{' '}
                <span className="font-medium text-foreground">{email}</span>{' '}
                y elegí tu nueva contraseña.
              </p>

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fp-code">Código de verificación</Label>
                  <Input
                    id="fp-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    aria-invalid={!!fieldErrors.code}
                    className="tracking-[0.5em] text-center text-xl font-mono"
                  />
                  {fieldErrors.code && (
                    <p className="text-xs text-destructive">{fieldErrors.code}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fp-new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="fp-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      aria-invalid={!!fieldErrors.newPassword}
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
                  {fieldErrors.newPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fp-confirm">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="fp-confirm"
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
                </div>

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
                  {loading ? 'Guardando...' : 'Cambiar contraseña'}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0
                      ? `Reenviar código en ${resendCooldown}s`
                      : '¿No llegó el código? Reenviar'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
