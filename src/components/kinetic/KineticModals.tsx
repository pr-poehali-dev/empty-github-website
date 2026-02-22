import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Character, Tournament, LeaderboardEntry } from '@/types/kinetic';
import * as api from '@/services/kineticApi';

// ─────────────────────────────────────────────────────────────
// Shared overlay wrapper
// ─────────────────────────────────────────────────────────────
const Overlay = ({
  show,
  onClose,
  children,
}: {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ShopModal
// ─────────────────────────────────────────────────────────────
interface ShopModalProps {
  show: boolean;
  onClose: () => void;
  character?: Character | null;
  onCharacterUpdate?: (char: Character) => void;
}

const ShopModal = ({ show, onClose, character }: ShopModalProps) => {
  const shopItems = [
    { id: 1, name: 'Скейт-борд Pro', icon: '🛹', cost: 150, type: 'equipment', desc: '+5 к скорости' },
    { id: 2, name: 'Защита Elite', icon: '🦺', cost: 100, type: 'outfit', desc: '+3 к смелости' },
    { id: 3, name: 'Шлем Aero', icon: '⛑️', cost: 80, type: 'equipment', desc: '+2 к защите' },
    { id: 4, name: 'Кроссовки Air', icon: '👟', cost: 120, type: 'outfit', desc: '+4 к балансу' },
    { id: 5, name: 'Бустер XP x2', icon: '⚡', cost: 200, type: 'booster', desc: 'x2 опыт на 24ч' },
    { id: 6, name: 'Анимация: Победа', icon: '🎉', cost: 250, type: 'animation', desc: 'Праздничная анимация' },
  ];

  return (
    <Overlay show={show} onClose={onClose}>
      <Card className="bg-gray-900 border-yellow-500/50 text-white max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
          <CardTitle className="text-yellow-300 flex items-center gap-2">
            <Icon name="ShoppingCart" size={20} />
            Магазин
          </CardTitle>
          <div className="flex items-center gap-3">
            {character && (
              <span className="text-yellow-400 font-semibold text-sm">
                💰 {character.kinetics}
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <Icon name="X" size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {shopItems.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-yellow-500/40 transition-colors"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
                <Badge className="text-[10px] px-1 py-0 bg-gray-700 text-gray-300 mt-1">
                  {item.type}
                </Badge>
              </div>
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white shrink-0"
                disabled={!character || character.kinetics < item.cost}
                onClick={async () => {
                  if (!character) return;
                  await api.purchaseItem(character.id, item.id, item.type, item.cost);
                }}
              >
                💰 {item.cost}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </Overlay>
  );
};

// ─────────────────────────────────────────────────────────────
// GamesModal
// ─────────────────────────────────────────────────────────────
interface GamesModalProps {
  show: boolean;
  onClose: () => void;
  setActiveGame: (game: 'simulator' | 'arena' | 'cards' | null) => void;
}

const GamesModal = ({ show, onClose, setActiveGame }: GamesModalProps) => {
  const games = [
    {
      id: 'simulator' as const,
      name: 'Симулятор трюков',
      icon: '🎮',
      desc: 'Повтори последовательность кнопок и выполни трюк',
      color: 'border-purple-500/50 hover:border-purple-400',
      badge: 'Память',
    },
    {
      id: 'arena' as const,
      name: 'Турнирная арена',
      icon: '🏆',
      desc: 'Сразись с ботом в трёх раундах трюков',
      color: 'border-yellow-500/50 hover:border-yellow-400',
      badge: 'Стратегия',
    },
    {
      id: 'cards' as const,
      name: 'Битва карточек',
      icon: '🃏',
      desc: 'Играй картами-трюками против соперника',
      color: 'border-blue-500/50 hover:border-blue-400',
      badge: 'Карточки',
    },
  ];

  return (
    <Overlay show={show} onClose={onClose}>
      <Card className="bg-gray-900 border-purple-500/50 text-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-700">
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Icon name="Gamepad2" size={20} />
            Игры
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <p className="text-sm text-gray-400 mb-2">
            Выбери игру, чтобы заработать XP и кинетики:
          </p>
          {games.map(game => (
            <button
              key={game.id}
              className={`w-full text-left bg-gray-800 rounded-xl p-4 border-2 transition-all ${game.color}`}
              onClick={() => {
                onClose();
                setActiveGame(game.id);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{game.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{game.name}</p>
                    <Badge className="text-[10px] px-1.5 py-0 bg-gray-700 text-gray-300">
                      {game.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{game.desc}</p>
                </div>
                <Icon name="ChevronRight" size={18} className="text-gray-500 shrink-0" />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </Overlay>
  );
};

// ─────────────────────────────────────────────────────────────
// TournamentsModal
// ─────────────────────────────────────────────────────────────
interface TournamentsModalProps {
  show: boolean;
  onClose: () => void;
  character?: Character | null;
  onCharacterUpdate?: (char: Character) => void;
}

const TournamentsModal = ({ show, onClose, character }: TournamentsModalProps) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    api.getCurrentTournament()
      .then(t => {
        setTournament(t);
        if (t) {
          return api.getTournamentLeaderboard(t.id);
        }
        return [];
      })
      .then(lb => setLeaderboard(lb))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [show]);

  const handleJoin = async () => {
    if (!tournament || !character) return;
    setJoining(true);
    try {
      await api.joinTournament(character.id, tournament.id);
      setJoined(true);
      const lb = await api.getTournamentLeaderboard(tournament.id);
      setLeaderboard(lb);
    } catch {
      // ignore
    } finally {
      setJoining(false);
    }
  };

  return (
    <Overlay show={show} onClose={onClose}>
      <Card className="bg-gray-900 border-green-500/50 text-white max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Icon name="Trophy" size={20} />
            Турниры
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
            </div>
          ) : !tournament ? (
            <div className="text-center py-8 text-gray-400">
              <Icon name="Trophy" size={40} className="mx-auto mb-3 opacity-30" />
              <p>Активных турниров нет</p>
              <p className="text-xs mt-1">Следи за новостями</p>
            </div>
          ) : (
            <>
              {/* Tournament info */}
              <div className="bg-gray-800 rounded-xl p-4 border border-green-700/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{tournament.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(tournament.start_date).toLocaleDateString('ru-RU')} —{' '}
                      {new Date(tournament.end_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <Badge className={`${
                    tournament.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                  } text-white text-xs`}>
                    {tournament.status === 'active' ? 'Активен' : tournament.status === 'upcoming' ? 'Скоро' : 'Завершён'}
                  </Badge>
                </div>
                {tournament.description && (
                  <p className="text-xs text-gray-400 mt-2">{tournament.description}</p>
                )}
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-yellow-400 font-semibold">
                    💰 Призовой фонд: {tournament.prize_pool}
                  </span>
                  <span className="text-gray-400">
                    Взнос: {tournament.entry_fee}
                  </span>
                </div>
              </div>

              {/* Join button */}
              {tournament.status === 'active' && character && !joined && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleJoin}
                  disabled={joining || character.kinetics < tournament.entry_fee}
                >
                  {joining
                    ? <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                    : <Icon name="LogIn" size={16} className="mr-2" />}
                  Участвовать (💰 {tournament.entry_fee})
                </Button>
              )}
              {joined && (
                <div className="text-center text-green-400 text-sm py-2">
                  ✅ Ты участвуешь в турнире!
                </div>
              )}

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Icon name="List" size={14} />
                    Таблица лидеров
                  </p>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 10).map(entry => (
                      <div
                        key={entry.rank}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                          entry.character?.id === character?.id
                            ? 'bg-green-900/40 border border-green-600'
                            : 'bg-gray-800'
                        }`}
                      >
                        <span className={`font-bold w-6 text-center ${
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-300' :
                          entry.rank === 3 ? 'text-orange-400' : 'text-gray-500'
                        }`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <span className="flex-1 truncate text-white">{entry.character?.name}</span>
                        <span className="text-yellow-400 font-semibold">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Overlay>
  );
};

// ─────────────────────────────────────────────────────────────
// ProModal
// ─────────────────────────────────────────────────────────────
interface ProModalProps {
  show: boolean;
  onClose: () => void;
}

const ProModal = ({ show, onClose }: ProModalProps) => {
  const perks = [
    { icon: '⚡', text: 'x2 XP за каждую тренировку' },
    { icon: '💰', text: '+50% кинетиков за игры' },
    { icon: '🎨', text: 'Эксклюзивные скины и анимации' },
    { icon: '🏆', text: 'Доступ к PRO-турнирам' },
    { icon: '🛍️', text: 'Скидка 20% в магазине' },
    { icon: '📊', text: 'Расширенная аналитика прогресса' },
    { icon: '🔔', text: 'Приоритетные уведомления' },
    { icon: '👑', text: 'Значок PRO на профиле' },
  ];

  return (
    <Overlay show={show} onClose={onClose}>
      <Card className="bg-gradient-to-br from-gray-900 to-yellow-900/30 border-yellow-500/60 text-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-yellow-700/40">
          <CardTitle className="text-yellow-300 flex items-center gap-2 text-xl">
            <Icon name="Crown" size={22} />
            Kinetic PRO
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Hero */}
          <div className="text-center py-2">
            <p className="text-4xl mb-2">👑</p>
            <p className="text-lg font-bold text-white">Стань PRO-райдером!</p>
            <p className="text-sm text-gray-400 mt-1">
              Открой все возможности платформы
            </p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-1 gap-2">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3 bg-yellow-900/20 rounded-lg px-3 py-2 border border-yellow-700/20">
                <span className="text-xl">{perk.icon}</span>
                <span className="text-sm text-gray-200">{perk.text}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-yellow-600/20 border border-yellow-500/40 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Стоимость подписки</p>
            <p className="text-3xl font-bold text-yellow-300">299 ₽</p>
            <p className="text-sm text-gray-400">в месяц</p>
          </div>

          <div className="bg-gray-800/60 rounded-lg p-3 text-center text-sm text-gray-400">
            <Icon name="Clock" size={14} className="inline mr-1" />
            В разработке — скоро будет доступно
          </div>

          <Button
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
            disabled
          >
            <Icon name="Crown" size={16} className="mr-2" />
            Оформить PRO (скоро)
          </Button>
        </CardContent>
      </Card>
    </Overlay>
  );
};

// ─────────────────────────────────────────────────────────────
// KineticModals — main export
// ─────────────────────────────────────────────────────────────
interface KineticModalsProps {
  showShop: boolean;
  setShowShop: (show: boolean) => void;
  showGames: boolean;
  setShowGames: (show: boolean) => void;
  showTournaments: boolean;
  setShowTournaments: (show: boolean) => void;
  showPro: boolean;
  setShowPro: (show: boolean) => void;
  setActiveGame: (game: 'simulator' | 'arena' | 'cards' | null) => void;
  character?: Character | null;
  onCharacterUpdate?: (char: Character) => void;
}

const KineticModals = ({
  showShop,
  setShowShop,
  showGames,
  setShowGames,
  showTournaments,
  setShowTournaments,
  showPro,
  setShowPro,
  setActiveGame,
  character,
  onCharacterUpdate,
}: KineticModalsProps) => {
  return (
    <>
      <ShopModal
        show={showShop}
        onClose={() => setShowShop(false)}
        character={character}
        onCharacterUpdate={onCharacterUpdate}
      />
      <GamesModal
        show={showGames}
        onClose={() => setShowGames(false)}
        setActiveGame={setActiveGame}
      />
      <TournamentsModal
        show={showTournaments}
        onClose={() => setShowTournaments(false)}
        character={character}
        onCharacterUpdate={onCharacterUpdate}
      />
      <ProModal
        show={showPro}
        onClose={() => setShowPro(false)}
      />
    </>
  );
};

export default KineticModals;
