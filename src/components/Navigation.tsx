import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  currentPage: 'home' | 'dashboard';
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

const Navigation = ({ currentPage, onSettingsClick }: NavigationProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel: Record<string, string> = {
    client: 'Клиент',
    admin: 'Администратор',
    director: 'Директор',
    trainer: 'Тренер',
  };

  const roleColor: Record<string, string> = {
    client: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    admin: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
    director: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
    trainer: 'bg-green-500/20 text-green-200 border-green-400/30',
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">⚡</span>
            <span className="font-black text-white text-lg tracking-wide">
              KINETIC <span className="text-yellow-300">KIDS</span>
            </span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    roleColor[user.role] || 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  {roleLabel[user.role] || user.role}
                </span>
                <span className="text-white/80 text-sm hidden md:block truncate max-w-[160px]">
                  {user.name}
                </span>
              </>
            )}

            {currentPage === 'dashboard' && onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={onSettingsClick}
                title="Настройки профиля"
              >
                <Icon name="Settings" size={18} />
              </Button>
            )}

            {currentPage === 'dashboard' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 gap-1.5"
                onClick={handleLogout}
              >
                <Icon name="LogOut" size={16} />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            )}

            {currentPage === 'home' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 gap-1.5"
                onClick={() => navigate('/dashboard')}
              >
                <Icon name="LayoutDashboard" size={16} />
                <span className="hidden sm:inline">Кабинет</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
