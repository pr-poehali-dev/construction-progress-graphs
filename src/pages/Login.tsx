import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { login as loginApi } from '@/lib/auth';
import Icon from '@/components/ui/icon';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    if (!captchaToken) {
      setError('Подтвердите, что вы не робот');
      return;
    }

    setLoading(true);

    try {
      const response = await loginApi(email, password, captchaToken);
      login(response.token, response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Shield" className="text-primary" size={24} />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
          <CardDescription className="text-center">
            Введите email и пароль для доступа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey="10000000-ffff-ffff-ffff-000000000001"
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-start gap-2">
                <Icon name="AlertCircle" size={20} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  Вход...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2" size={16} />
                  Войти
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Демо аккаунт:</p>
            <p className="font-mono text-xs mt-1">admin@example.com / Admin123!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
