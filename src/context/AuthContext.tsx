import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiPost } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
}

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setSession: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

// Reads and validates the stored user. Returns null if missing or malformed.
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    // Require all three fields — prevents acting on a stale/partial object
    if (parsed.id && parsed.email && parsed.role) {
      return parsed as User;
    }
    return null;
  } catch {
    return null;
  }
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializers run synchronously on first render — no flash of unauthenticated content
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  // Mount-time consistency check: if token XOR user is missing, the pair is invalid.
  // Also clears sessions with expired JWTs so the user is prompted to log in again
  // instead of receiving silent 401s from the backend.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = readStoredUser();

    if (storedToken && storedUser) {
      // Check if token is expired before trusting it
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          clearStorage();
          setToken(null);
          setUser(null);
          return;
        }
      } catch {
        clearStorage();
        setToken(null);
        setUser(null);
        return;
      }
      // Sync state in case a previous tab updated localStorage without triggering React state
      setToken(storedToken);
      setUser(storedUser);
    } else if (storedToken || storedUser) {
      // One exists but not the other — corrupted session, wipe everything
      clearStorage();
      setToken(null);
      setUser(null);
    }
    // If neither exists: already null from lazy init, nothing to do
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setSession = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const loginWithToken = async (email: string, password: string) => {
    const res = await apiPost<any>('/auth/login', { email, password });
    const payload = JSON.parse(atob(res.access_token.split('.')[1]));
    const user: User = { id: payload.user_id, email: payload.email, role: payload.role };
    setSession(res.access_token, user);
  };

  const login = loginWithToken;

  const register = async (email: string, password: string) => {
    await apiPost('/auth/register', { email, password });
    await loginWithToken(email, password);
  };

  const logout = () => {
    clearStorage();
    setToken(null);
    setUser(null);
    // Navigation must happen in the component that calls logout()
    // because AuthProvider lives outside <BrowserRouter>.
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, login, register, logout, setSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
