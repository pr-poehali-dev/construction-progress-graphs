import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, verifyToken, getStoredToken, setStoredToken, logout as logoutApi } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      
      if (storedToken) {
        try {
          const { user: verifiedUser } = await verifyToken(storedToken);
          setUser(verifiedUser);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('auth_token');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setStoredToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    if (token) {
      await logoutApi(token);
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
