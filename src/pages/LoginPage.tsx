import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginDialog } from '@/components/site/LoginDialog';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const redirect = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    if (isAuthenticated) navigate(redirect, { replace: true });
  }, [isAuthenticated]);

  return (
    <LoginDialog
      open
      onClose={() => navigate('/')}
      onSuccess={() => navigate(redirect, { replace: true })}
    />
  );
}
