import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

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

const BUBBLES = [
  { id: 0, size: 10, left: 8,  duration: 5,   delay: 0   },
  { id: 1, size: 18, left: 22, duration: 7,   delay: 1.2 },
  { id: 2, size: 8,  left: 40, duration: 4.5, delay: 0.5 },
  { id: 3, size: 14, left: 58, duration: 6,   delay: 2   },
  { id: 4, size: 20, left: 72, duration: 8,   delay: 0.8 },
  { id: 5, size: 9,  left: 85, duration: 5.5, delay: 1.7 },
];

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
      <div className="container max-w-md pt-16 pb-12 px-4">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>

        <Card className="overflow-hidden border-0 shadow-lg">
          {/* Branded header */}
          <div className="relative h-36 gradient-deep overflow-hidden">
            {BUBBLES.map((b) => (
              <motion.div
                key={b.id}
                className="absolute bottom-0 rounded-full bg-white/20 border border-white/30 pointer-events-none"
                style={{ width: b.size, height: b.size, left: `${b.left}%` }}
                animate={{ y: [-b.size, -140], opacity: [0, 0.7, 0] }}
                transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            <div className="relative z-10 flex h-full items-center justify-center">
              <img src="/Pooled blanco.svg" alt="Pooled" className="h-20 w-auto" />
            </div>
          </div>

          <CardContent className="px-6 pb-6 pt-5">
            <AnimatePresence mode="wait">
              {step === 'forgot' ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-5 w-5 text-cyan-500" />
                    <h2 className="font-display text-xl font-bold">Recuperar contraseña</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Ingresá tu email y te enviamos un código de verificación.
                  </p>

                  <form onSubmit={handleForgot} className="space-y-4">
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
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-cyan-500" />
                    <h2 className="font-display text-xl font-bold">Nueva contraseña</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Ingresá el código que enviamos a{' '}
                    <span className="font-medium text-foreground">{email}</span> y elegí tu nueva contraseña.
                  </p>

                  <form onSubmit={handleReset} className="space-y-4">
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
                        className="tracking-widest text-center text-lg font-mono"
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
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
