import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Application, User } from '@/types/auth';
import Navigation from '@/components/Navigation';
import ProfileSettings from '@/components/ProfileSettings';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const stored = localStorage.getItem('fitness_app_data');
    if (stored) {
      const data = JSON.parse(stored);
      setApplications(data.applications || []);
      setUsers(data.users || []);
    }
  };

  const handleApplicationAction = (appId: string, action: 'approved' | 'rejected') => {
    const stored = localStorage.getItem('fitness_app_data');
    if (stored) {
      const data = JSON.parse(stored);
      const updatedApplications = data.applications.map((app: Application) =>
        app.id === appId
          ? { ...app, status: action, reviewedBy: user?.name || '', reviewedAt: new Date() }
          : app
      );
      const newData = { ...data, applications: updatedApplications };
      localStorage.setItem('fitness_app_data', JSON.stringify(newData));
      setApplications(updatedApplications);
      toast({
        title: action === 'approved' ? '✅ Заявка одобрена' : '❌ Заявка отклонена',
        description: `Статус заявки обновлён`,
      });
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const processedApplications = applications.filter(app => app.status !== 'pending');
  const clientUsers = users.filter(u => u.role === 'client');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">Необходимо войти в систему</p>
          <Button onClick={() => navigate('/')} className="bg-white text-purple-900 hover:bg-white/90">
            На главную
          </Button>
        </div>
      </div>
    );
  }

  const ApplicationCard = ({ app }: { app: Application }) => (
    <div className="border rounded-lg p-4 space-y-3 hover:border-orange-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{app.userName}</p>
            <span className="text-xs text-gray-400">{app.userEmail}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1 font-medium">{app.program}</p>
          {app.message && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{app.message}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(app.createdAt).toLocaleDateString('ru-RU', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="shrink-0">
          {app.status === 'pending' ? (
            <Badge variant="secondary">⏳ Ожидает</Badge>
          ) : app.status === 'approved' ? (
            <Badge className="bg-green-100 text-green-800">✅ Одобрено</Badge>
          ) : (
            <Badge variant="destructive">❌ Отклонено</Badge>
          )}
        </div>
      </div>
      {app.status === 'pending' && (
        <div className="flex gap-2 pt-1 border-t">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={() => handleApplicationAction(app.id, 'approved')}
          >
            <Icon name="Check" size={14} />
            Одобрить
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5"
            onClick={() => handleApplicationAction(app.id, 'rejected')}
          >
            <Icon name="X" size={14} />
            Отклонить
          </Button>
        </div>
      )}
      {app.reviewedBy && (
        <p className="text-xs text-gray-400 border-t pt-2">
          Проверено: {app.reviewedBy}
          {app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleDateString('ru-RU')}`}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation
        currentPage="dashboard"
        showSettings
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="ShieldCheck" size={24} className="text-orange-300" />
            Панель администратора
          </h1>
          <p className="text-white/60 text-sm mt-1">Управление заявками и пользователями</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Пользователей', value: users.length, icon: 'Users', color: 'text-blue-300' },
            { label: 'Клиентов', value: clientUsers.length, icon: 'UserCheck', color: 'text-green-300' },
            { label: 'Новых заявок', value: pendingApplications.length, icon: 'Bell', color: 'text-yellow-300' },
            { label: 'Обработано', value: processedApplications.length, icon: 'CheckSquare', color: 'text-purple-300' },
          ].map(stat => (
            <Card key={stat.label} className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={stat.icon} size={16} className={stat.color} />
                  <span className="text-xs text-white/60">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              ⏳ Новые заявки
              {pendingApplications.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1">
                  {pendingApplications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="processed" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              ✅ Обработанные
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              👥 Пользователи
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Clock" size={18} className="text-yellow-600" />
                  Заявки на рассмотрение
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApplications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="CheckCircle2" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Новых заявок нет — всё обработано!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApplications.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processed */}
          <TabsContent value="processed">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="CheckSquare" size={18} className="text-green-600" />
                  Обработанные заявки
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedApplications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Обработанных заявок нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {processedApplications.map(app => (
                      <ApplicationCard key={app.id} app={app} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Users" size={18} />
                  Все пользователи ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="UserX" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Нет зарегистрированных пользователей</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.map(u => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-base font-bold text-purple-700 shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Badge
                            className={
                              u.role === 'director'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'admin'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                            variant="outline"
                          >
                            {u.role === 'director' ? 'Директор'
                              : u.role === 'admin' ? 'Администратор'
                              : 'Клиент'}
                          </Badge>
                          <span className={`text-xs ${u.isActive ? 'text-green-600' : 'text-red-500'}`}>
                            {u.isActive ? '● онлайн' : '● офлайн'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default AdminDashboard;
