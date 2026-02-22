import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings = ({ onClose }: ProfileSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: 'Ошибка', description: 'Имя не может быть пустым', variant: 'destructive' });
      return;
    }
    // Update stored user
    const stored = localStorage.getItem('fitness_app_data');
    if (stored && user) {
      const data = JSON.parse(stored);
      const updatedUsers = data.users.map((u: { id: string; name: string; email: string }) =>
        u.id === user.id ? { ...u, name, email } : u
      );
      localStorage.setItem('fitness_app_data', JSON.stringify({ ...data, users: updatedUsers }));
      const updatedUser = { ...user, name, email };
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
    toast({ title: 'Сохранено', description: 'Профиль обновлён' });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon name="UserCog" size={20} />
            Настройки профиля
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ps-name">Имя</Label>
            <Input
              id="ps-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ps-email">Email</Label>
            <Input
              id="ps-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Роль</Label>
            <div className="h-10 px-3 flex items-center rounded-md border bg-gray-50 text-sm text-gray-600">
              {user?.role === 'client' ? 'Клиент'
                : user?.role === 'admin' ? 'Администратор'
                : user?.role === 'director' ? 'Директор'
                : user?.role}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
