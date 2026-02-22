import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Purchase, Application, ChatMessage } from '@/types/auth';
import Navigation from '@/components/Navigation';
import ProfileSettings from '@/components/ProfileSettings';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    const stored = localStorage.getItem('fitness_app_data');
    if (stored && user) {
      const data = JSON.parse(stored);
      setPurchases((data.purchases || []).filter((p: Purchase) => p.userId === user.id));
      setApplications((data.applications || []).filter((a: Application) => a.userId === user.id));
      setChatMessages((data.chatMessages || []).filter((m: ChatMessage) => m.userId === user.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">⏳ Ожидает</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">✅ Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="destructive">❌ Отклонено</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✅ Завершено</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">❌ Отменено</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingApps = applications.filter(a => a.status === 'pending').length;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation
        currentPage="dashboard"
        showSettings
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome */}
        <div className="text-white">
          <h1 className="text-2xl font-bold">
            Привет, {user.name}! 👋
          </h1>
          <p className="text-white/60 text-sm mt-1">Личный кабинет клиента</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Заявок всего', value: applications.length, icon: 'FileText', color: 'text-blue-300' },
            { label: 'Ожидает ответа', value: pendingApps, icon: 'Clock', color: 'text-yellow-300' },
            { label: 'Покупок', value: purchases.length, icon: 'ShoppingCart', color: 'text-green-300' },
            { label: 'Потрачено (₽)', value: totalPurchases.toLocaleString(), icon: 'Wallet', color: 'text-purple-300' },
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

        {/* Tabs */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="applications" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              📋 Заявки
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              🛒 Покупки
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              💬 Чат
            </TabsTrigger>
          </TabsList>

          {/* Applications */}
          <TabsContent value="applications">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="FileText" size={18} />
                  Мои заявки
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="Inbox" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Заявок ещё нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map(app => (
                      <div
                        key={app.id}
                        className="border rounded-lg p-4 hover:border-purple-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{app.program}</p>
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{app.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(app.createdAt).toLocaleDateString('ru-RU', {
                                day: '2-digit', month: 'long', year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="shrink-0">{getStatusBadge(app.status)}</div>
                        </div>
                        {app.reviewedBy && (
                          <p className="text-xs text-gray-400 mt-2 border-t pt-2">
                            Проверено: {app.reviewedBy}
                            {app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleDateString('ru-RU')}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases */}
          <TabsContent value="purchases">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="ShoppingCart" size={18} />
                  История покупок
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="ShoppingBag" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Покупок ещё нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchases.map(purchase => (
                      <div
                        key={purchase.id}
                        className="border rounded-lg p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{purchase.program}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(purchase.date).toLocaleDateString('ru-RU', {
                              day: '2-digit', month: 'long', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-gray-900">
                            {purchase.amount.toLocaleString()} ₽
                          </span>
                          {getStatusBadge(purchase.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat */}
          <TabsContent value="chat">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="MessageCircle" size={18} />
                  История чата
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Сообщений ещё нет</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[75%] text-sm">
                            {msg.message}
                          </div>
                        </div>
                        {msg.response && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[75%] text-sm">
                              {msg.response}
                            </div>
                          </div>
                        )}
                        <p className="text-center text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
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

export default ClientDashboard;
