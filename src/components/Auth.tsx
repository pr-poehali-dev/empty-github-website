import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onClose?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user already logged in, close/redirect
  React.useEffect(() => {
    if (user) {
      onClose?.();
    }
  }, [user, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: 'Ошибка', description: 'Заполните email и пароль', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      let success = false;

      if (isLogin) {
        success = await login(email.trim(), password);
        if (!success) {
          toast({
            title: 'Ошибка входа',
            description: 'Неверный email или пароль',
            variant: 'destructive',
          });
        }
      } else {
        if (name.trim().length < 2) {
          toast({
            title: 'Ошибка регистрации',
            description: 'Имя должно содержать минимум 2 символа',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        const ageNum = parseInt(age, 10);
        if (!age || isNaN(ageNum) || ageNum < 3 || ageNum > 99) {
          toast({
            title: 'Ошибка регистрации',
            description: 'Укажите возраст от 3 до 99 лет',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          toast({
            title: 'Ошибка регистрации',
            description: 'Пароль должен содержать минимум 6 символов',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        success = await register(email.trim(), password, name.trim(), ageNum);
        if (!success) {
          toast({
            title: 'Ошибка регистрации',
            description: 'Пользователь с таким email уже существует',
            variant: 'destructive',
          });
        }
      }

      if (success) {
        toast({
          title: isLogin ? '👋 Добро пожаловать!' : '🎉 Регистрация успешна!',
          description: isLogin ? 'Вы успешно вошли в систему' : 'Аккаунт создан. Добро пожаловать!',
        });
        onClose?.();

        // Route by role is handled by AuthContext consumer, but navigate to dashboard
        setTimeout(() => navigate('/dashboard'), 100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden">
        {/* Gradient header */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-gray-900">
                {isLogin ? '👋 Вход' : '🚀 Регистрация'}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin ? 'Рады видеть вас снова!' : 'Присоединяйся к Kinetic Kids!'}
              </p>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 -mt-1"
              >
                <Icon name="X" size={20} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name" className="text-sm font-medium">
                  Имя <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="auth-name"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-sm font-medium">
                Пароль <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isLogin ? 'Введите пароль' : 'Минимум 6 символов'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                </button>
              </div>
            </div>

            {/* Age field (register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-age" className="text-sm font-medium">
                  Возраст <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="auth-age"
                  type="number"
                  placeholder="Например: 12"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  min={3}
                  max={99}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white font-bold h-11 text-base shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  {isLogin ? 'Входим...' : 'Регистрируем...'}
                </span>
              ) : isLogin ? (
                '→ Войти'
              ) : (
                '🚀 Создать аккаунт'
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-5 text-center border-t pt-4">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Ещё нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button
                type="button"
                className="font-semibold text-orange-600 hover:text-orange-700 underline underline-offset-2"
                onClick={() => {
                  setIsLogin(v => !v);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setAge('');
                }}
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
