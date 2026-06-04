import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Waves, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Tab = 'login' | 'register';

const BUBBLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: 8 + Math.random() * 16,
  left: 5 + Math.random() * 90,
  duration: 4 + Math.random() * 4,
  delay: Math.random() * 3,
}));

export function LoginDialog({ open, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const reset = () => {
    setEmail('');
    setPassword('');
    setLoading(false);
    setTab('login');
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        toast.success('¡Bienvenido de vuelta!');
      } else {
        await register(email, password);
        toast.success('¡Cuenta creada! Ya estás dentro.');
      }
      handleClose();
      onSuccess?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 gap-0">
        <DialogTitle className="sr-only">
          {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </DialogTitle>

        {/* Header con temática de pileta */}
        <div className="relative h-36 gradient-deep overflow-hidden">
          {/* Bubbles */}
          {BUBBLES.map((b) => (
            <motion.div
              key={b.id}
              className="absolute bottom-0 rounded-full bg-white/20 border border-white/30"
              style={{ width: b.size, height: b.size, left: `${b.left}%` }}
              animate={{ y: [-b.size, -160], opacity: [0, 0.7, 0] }}
              transition={{
                duration: b.duration,
                delay: b.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Wave bottom */}
          <svg
            className="absolute bottom-0 w-full"
            viewBox="0 0 400 30"
            preserveAspectRatio="none"
            style={{ height: 30 }}
          >
            <path
              d="M0,15 C50,30 100,0 150,15 C200,30 250,0 300,15 C350,30 400,0 400,15 L400,30 L0,30 Z"
              fill="hsl(var(--background))"
            />
          </svg>

          {/* Logo */}
          <div className="relative z-10 flex items-center justify-center h-full pb-4">
            <img src="/Pooled blanco.svg" alt="Pooled" className="h-12 md:h-[12.5rem] w-auto drop-shadow" />
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 pb-6 pt-2">
          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                  tab === t
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
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
              transition={{ duration: 0.2 }}
              onSubmit={submit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full gradient-aqua text-primary-foreground hover:opacity-90 gap-2"
              >
                <Waves className="h-4 w-4" />
                {loading
                  ? 'Un momento...'
                  : tab === 'login' ? 'Zambullirse' : 'Crear cuenta'
                }
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {tab === 'login'
                  ? <>¿No tenés cuenta?{' '}
                      <button type="button" onClick={() => setTab('register')} className="text-primary underline-offset-2 hover:underline">
                        Registrate
                      </button>
                    </>
                  : <>¿Ya tenés cuenta?{' '}
                      <button type="button" onClick={() => setTab('login')} className="text-primary underline-offset-2 hover:underline">
                        Ingresá
                      </button>
                    </>
                }
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
