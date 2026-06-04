import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCircle2, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg pt-24 pb-12">


        <h1 className="font-display text-3xl font-bold mb-6">Mi Perfil</h1>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="grid place-items-center h-16 w-16 rounded-full gradient-aqua text-primary-foreground shadow-aqua">
                <UserCircle2 className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="font-display text-lg">{user?.email}</CardTitle>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="mt-1 capitalize">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">ID de usuario</p>
                <p className="text-sm font-mono text-muted-foreground">{user?.id}</p>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full mt-2"
              onClick={logout}
            >
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
