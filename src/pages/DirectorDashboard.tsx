import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Application, ChatMessage, Purchase, UserActivity } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import ProfileSettings from '@/components/ProfileSettings';
import { useNavigate } from 'react-router-dom';

const DirectorDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'client' | 'admin'>('client');

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = localStorage.getItem('fitness_app_data');
    if (stored) {
      const data = JSON.parse(stored);
      setUsers(data.users || []);
      setApplications(data.applications || []);
      setChatMessages(data.chatMessages || []);
      setPurchases(data.purchases || []);
      setUserActivities(data.userActivities || []);
    }
  };

  const handleRoleChange = (userId: string, newRole: 'client' | 'admin' | 'director') => {
    const stored = localStorage.getItem('fitness_app_data');
    if (!stored) return;
    const data = JSON.parse(stored);
    const updatedUsers = data.users.map((u: User) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    localStorage.setItem('fitness_app_data', JSON.stringify({ ...data, users: updatedUsers }));
    setUsers(updatedUsers);
    toast({ title: '✅ Роль изменена', description: `Пользователю назначена роль: ${newRole}` });
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast({ title: 'Ошибка', description: 'Нельзя удалить себя', variant: 'destructive' });
      return;
    }
    const stored = localStorage.getItem('fitness_app_data');
    if (!stored) return;
    const data = JSON.parse(stored);
    const updatedUsers = data.users.filter((u: User) => u.id !== userId);
    localStorage.setItem('fitness_app_data', JSON.stringify({ ...data, users: updatedUsers }));
    setUsers(updatedUsers);
    toast({ title: '🗑️ Пользователь удалён' });
  };

  const handleCreateUser = () => {
    if (!newUserEmail.trim() || !newUserName.trim() || !newUserPassword.trim()) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    const stored = localStorage.getItem('fitness_app_data');
    if (!stored) return;
    const data = JSON.parse(stored);
    if (data.users.find((u: User) => u.email === newUserEmail)) {
      toast({ title: 'Ошибка', description: 'Email уже занят', variant: 'destructive' });
      return;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: newUserEmail,
      password: newUserPassword,
      name: newUserName,
      role: newUserRole,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    };
    const updatedUsers = [...data.users, newUser];
    localStorage.setItem('fitness_app_data', JSON.stringify({ ...data, users: updatedUsers }));
    setUsers(updatedUsers);
    setNewUserEmail('');
    setNewUserName('');
    setNewUserPassword('');
    toast({ title: '✅ Пользователь создан', description: `${newUser.name} (${newUser.role})` });
  };

  const handleApplicationAction = (appId: string, action: 'approved' | 'rejected') => {
    const stored = localStorage.getItem('fitness_app_data');
    if (!stored) return;
    const data = JSON.parse(stored);
    const updatedApps = data.applications.map((a: Application) =>
      a.id === appId ? { ...a, status: action, reviewedBy: user?.name, reviewedAt: new Date() } : a
    );
    localStorage.setItem('fitness_app_data', JSON.stringify({ ...data, applications: updatedApps }));
    setApplications(updatedApps);
    toast({ title: action === 'approved' ? '✅ Одобрено' : '❌ Отклонено' });
  };

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

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingApps = applications.filter(a => a.status === 'pending');
  const clientCount = users.filter(u => u.role === 'client').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  const roleLabel: Record<string, string> = { client: 'Клиент', admin: 'Администратор', director: 'Директор' };
  const roleColor: Record<string, string> = {
    director: 'bg-purple-100 text-purple-800',
    admin: 'bg-orange-100 text-orange-800',
    client: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation
        currentPage="dashboard"
        showSettings
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="Crown" size={24} className="text-yellow-300" />
            Панель директора
          </h1>
          <p className="text-white/60 text-sm mt-1">Полный контроль над школой</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Всего пользователей', value: users.length, icon: 'Users', color: 'text-blue-300' },
            { label: 'Клиентов', value: clientCount, icon: 'User', color: 'text-green-300' },
            { label: 'Администраторов', value: adminCount, icon: 'Shield', color: 'text-orange-300' },
            { label: 'Заявок', value: applications.length, icon: 'FileText', color: 'text-cyan-300' },
            { label: 'Новых заявок', value: pendingApps.length, icon: 'Bell', color: 'text-yellow-300' },
            { label: 'Выручка (₽)', value: totalRevenue.toLocaleString(), icon: 'TrendingUp', color: 'text-emerald-300' },
          ].map(stat => (
            <Card key={stat.label} className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-3 pb-3 px-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon name={stat.icon} size={14} className={stat.color} />
                  <span className="text-[11px] text-white/60 leading-tight">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20 flex-wrap h-auto gap-1">
            {[
              { value: 'users', label: '👥 Пользователи' },
              { value: 'applications', label: '📋 Заявки' },
              { value: 'activity', label: '📊 Активность' },
              { value: 'chat', label: '💬 Чат' },
              { value: 'create', label: '➕ Создать' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Users */}
          <TabsContent value="users">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg">
                    <Icon name="Users" size={18} />
                    Управление пользователями
                  </span>
                </CardTitle>
                <Input
                  placeholder="Поиск по имени или email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="max-w-sm"
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-sm font-bold text-purple-700 shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            {u.id === user.id && (
                              <Badge className="text-[10px] px-1 py-0 bg-purple-100 text-purple-800">Вы</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          <p className="text-[10px] text-gray-400">
                            Создан: {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={roleColor[u.role] || 'bg-gray-100 text-gray-800'} variant="outline">
                          {roleLabel[u.role] || u.role}
                        </Badge>
                        {u.id !== user.id && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2"
                              onClick={() => { setSelectedUser(u); setShowUserDetail(true); }}
                            >
                              <Icon name="Eye" size={12} />
                            </Button>
                            {u.role !== 'director' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-2"
                                onClick={() => handleRoleChange(u.id, u.role === 'admin' ? 'client' : 'admin')}
                                title={u.role === 'admin' ? 'Снизить до клиента' : 'Повысить до администратора'}
                              >
                                <Icon name={u.role === 'admin' ? 'ArrowDown' : 'ArrowUp'} size={12} />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-2 text-red-500 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Icon name="Trash2" size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Icon name="UserX" size={36} className="mx-auto mb-2 opacity-40" />
                      <p>Пользователи не найдены</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications */}
          <TabsContent value="applications">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="FileText" size={18} />
                  Все заявки ({applications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Заявок нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div key={app.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{app.userName}</p>
                            <p className="text-xs text-gray-500">{app.userEmail}</p>
                            <p className="text-sm text-gray-700 mt-1">{app.program}</p>
                            {app.message && (
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{app.message}</p>
                            )}
                          </div>
                          <div className="shrink-0">
                            {app.status === 'pending' ? (
                              <Badge variant="secondary">⏳</Badge>
                            ) : app.status === 'approved' ? (
                              <Badge className="bg-green-100 text-green-800">✅</Badge>
                            ) : (
                              <Badge variant="destructive">❌</Badge>
                            )}
                          </div>
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex gap-2 border-t pt-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1"
                              onClick={() => handleApplicationAction(app.id, 'approved')}
                            >
                              <Icon name="Check" size={13} /> Одобрить
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => handleApplicationAction(app.id, 'rejected')}
                            >
                              <Icon name="X" size={13} /> Отклонить
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Activity" size={18} />
                  Журнал активности ({userActivities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userActivities.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="Clock" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Активности нет</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {[...userActivities].reverse().map(activity => {
                      const actUser = users.find(u => u.id === activity.userId);
                      return (
                        <div key={activity.id} className="flex items-start gap-3 border rounded-lg p-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                            {actUser?.name.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {actUser?.name || activity.userId}
                              </p>
                              <span className="text-xs text-gray-400 shrink-0">
                                {new Date(activity.timestamp).toLocaleString('ru-RU', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{activity.details}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat history */}
          <TabsContent value="chat">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="MessageCircle" size={18} />
                  История всех чатов ({chatMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Сообщений нет</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {chatMessages.map(msg => {
                      const msgUser = users.find(u => u.id === msg.userId);
                      return (
                        <div key={msg.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {msgUser?.name || msg.userId}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.timestamp).toLocaleString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 bg-blue-50 rounded px-3 py-2">{msg.message}</p>
                          {msg.response && (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 mt-1">{msg.response}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create user */}
          <TabsContent value="create">
            <Card className="bg-white/95 max-w-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="UserPlus" size={18} />
                  Создать пользователя
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Имя</label>
                  <Input
                    placeholder="Иван Иванов"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Пароль</label>
                  <Input
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Роль</label>
                  <div className="flex gap-2">
                    {(['client', 'admin'] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => setNewUserRole(role)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          newUserRole === role
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {role === 'client' ? 'Клиент' : 'Администратор'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2" onClick={handleCreateUser}>
                  <Icon name="UserPlus" size={16} />
                  Создать пользователя
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User detail modal */}
      {showUserDetail && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUserDetail(false)}
        >
          <Card className="w-full max-w-sm bg-white" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
              <CardTitle className="text-lg">Профиль пользователя</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowUserDetail(false)}>
                <Icon name="X" size={18} />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-xl font-bold text-purple-700">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              {[
                { label: 'Роль', value: roleLabel[selectedUser.role] || selectedUser.role },
                { label: 'Зарегистрирован', value: new Date(selectedUser.createdAt).toLocaleDateString('ru-RU') },
                { label: 'Последняя активность', value: new Date(selectedUser.lastActivity).toLocaleDateString('ru-RU') },
                { label: 'Статус', value: selectedUser.isActive ? 'Активен' : 'Заблокирован' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-sm border-b pb-2">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 text-center bg-gray-50 rounded-lg p-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {applications.filter(a => a.userId === selectedUser.id).length}
                  </p>
                  <p className="text-xs text-gray-500">Заявок</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {purchases.filter(p => p.userId === selectedUser.id).reduce((s, p) => s + p.amount, 0).toLocaleString()} ₽
                  </p>
                  <p className="text-xs text-gray-500">Потрачено</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default DirectorDashboard;
