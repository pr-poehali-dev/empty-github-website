import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { CharacterNotification } from '@/types/kinetic';
import * as api from '@/services/kineticApi';

interface NotificationBellProps {
  characterId: number;
  onKineticsUpdate?: () => void;
}

const NotificationBell = ({ characterId, onKineticsUpdate: _onKineticsUpdate }: NotificationBellProps) => {
  const [notifications, setNotifications] = useState<CharacterNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<CharacterNotification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const notifs = await api.getNotifications(characterId);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch {
      // silently ignore
    }
  }, [characterId]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
        setSelectedNotif(null);
      }
    };
    if (showPanel) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPanel]);

  const handleOpen = async () => {
    setShowPanel(prev => !prev);
    setSelectedNotif(null);
    if (!showPanel && unreadCount > 0) {
      // Mark each unread notification as read
      const unread = notifications.filter(n => !n.is_read);
      await Promise.allSettled(unread.map(n => api.markNotificationAsRead(n.id)));
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kinetics': return '💰';
      case 'achievement': return '🏆';
      case 'tricks': return '✅';
      case 'purchase': return '🛍️';
      case 'welcome': return '🎉';
      case 'level_up': return '⬆️';
      case 'tournament': return '🏟️';
      case 'weekly_results': return '📊';
      default: return '📢';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'только что';
    if (mins < 60) return `${mins} мин назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} д назад`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleOpen}
        aria-label="Уведомления"
      >
        <Icon name="Bell" size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {showPanel && (
        <div className="absolute right-0 top-10 z-50 w-80">
          <Card className="shadow-2xl border border-gray-200">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Bell" size={16} />
                Уведомления
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => { setShowPanel(false); setSelectedNotif(null); }}
              >
                <Icon name="X" size={14} />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {/* Detail view */}
              {selectedNotif ? (
                <div className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-3 text-xs text-gray-500 -ml-2"
                    onClick={() => setSelectedNotif(null)}
                  >
                    <Icon name="ChevronLeft" size={14} className="mr-1" />
                    Назад
                  </Button>
                  <div className="text-2xl mb-2">{getTypeIcon(selectedNotif.type)}</div>
                  <p className="font-semibold text-gray-900 mb-1">{selectedNotif.title}</p>
                  <p className="text-sm text-gray-600 mb-3">{selectedNotif.message}</p>
                  <p className="text-xs text-gray-400">{formatDate(selectedNotif.created_at)}</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                      <Icon name="BellOff" size={32} className="mx-auto mb-2 opacity-40" />
                      Нет уведомлений
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <button
                        key={notif.id}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                          !notif.is_read ? 'bg-blue-50/60' : ''
                        }`}
                        onClick={() => setSelectedNotif(notif)}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{getTypeIcon(notif.type)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className={`text-sm font-medium truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.title}
                            </p>
                            {!notif.is_read && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(notif.created_at)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
