import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import AnimatedCharacter from '@/components/kinetic/AnimatedCharacter';
import CharacterInfoCard from '@/components/kinetic/CharacterInfoCard';
import KineticTabs from '@/components/kinetic/KineticTabs';
import KineticModals from '@/components/kinetic/KineticModals';
import NotificationBell from '@/components/kinetic/NotificationBell';
import TrickSimulator from '@/components/kinetic/games/TrickSimulator';
import TournamentArena from '@/components/kinetic/games/TournamentArena';
import CardBattle from '@/components/kinetic/games/CardBattle';
import { Character, Trick, CharacterTrick } from '@/types/kinetic';
import { useToast } from '@/hooks/use-toast';
import { fireConfetti } from '@/utils/confetti';
import * as api from '@/services/kineticApi';

// ── Helpers ────────────────────────────────────────────────────
const getExperienceForNextLevel = (level: number) => level * 100;

const KineticUniverse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── State ───────────────────────────────────────────────────
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [masteredTricks, setMasteredTricks] = useState<CharacterTrick[]>([]);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  // Modal visibility
  const [showShop, setShowShop] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showPro, setShowPro] = useState(false);

  // Active mini-game
  const [activeGame, setActiveGame] = useState<'simulator' | 'arena' | 'cards' | null>(null);

  // ── Data loading ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user?.id) {
      navigate('/');
      return;
    }
    try {
      const [char, allChars, allTricks] = await Promise.all([
        api.getMyCharacter(user.id),
        api.getAllCharacters(),
        api.getTricks(),
      ]);

      if (!char) {
        navigate('/character-creation');
        return;
      }

      setCharacter(char);
      setCharacters(allChars || []);
      setTricks(allTricks || []);

      const mastered = await api.getMasteredTricks(char.id);
      setMasteredTricks(mastered || []);
    } catch (err) {
      toast({
        title: 'Ошибка загрузки',
        description: err instanceof Error ? err.message : 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Character update helper (after games / purchases) ───────
  const refreshCharacter = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [char, mastered] = await Promise.all([
        api.getMyCharacter(user.id),
        character ? api.getMasteredTricks(character.id) : Promise.resolve([]),
      ]);
      if (char) setCharacter(char);
      if (mastered) setMasteredTricks(mastered);
    } catch {
      // silently ignore background refresh errors
    }
  }, [user?.id, character]);

  const handleCharacterUpdate = useCallback((updatedChar: Character) => {
    const oldLevel = character?.level ?? 0;
    setCharacter(updatedChar);

    if (updatedChar.level > oldLevel) {
      setCelebrating(true);
      fireConfetti();
      toast({
        title: `🎉 Уровень ${updatedChar.level}!`,
        description: `${updatedChar.name} достиг нового уровня! Так держать!`,
      });
      setTimeout(() => setCelebrating(false), 3000);
    }
  }, [character?.level, toast]);

  // ── Trick helpers ──────────────────────────────────────────
  const isTrickMastered = useCallback(
    (trickId: number) => masteredTricks.some(mt => mt.trick_id === trickId),
    [masteredTricks]
  );

  const getTricksByCategory = useCallback(
    (category: string) => tricks.filter(t => t.category === category),
    [tricks]
  );

  const getTrickProgress = useCallback(() => {
    if (tricks.length === 0) return 0;
    return (masteredTricks.length / tricks.length) * 100;
  }, [tricks.length, masteredTricks.length]);

  // ── Game completion handler ────────────────────────────────
  const handleGameComplete = useCallback(
    async (earnedXP: number, earnedKinetics: number, won: boolean, gameType: string) => {
      setActiveGame(null);

      if (!character) return;

      try {
        await api.recordGameResult(character.id, gameType, {
          earned_xp: earnedXP,
          earned_kinetics: earnedKinetics,
          won,
        });
        if (earnedKinetics > 0) {
          await api.addKinetics(character.id, earnedKinetics, `game_${gameType}`);
        }
        await refreshCharacter();

        toast({
          title: won ? '🏆 Победа!' : '💪 Игра завершена',
          description: `+${earnedXP} XP · +${earnedKinetics} кинетиков`,
        });
      } catch {
        toast({
          title: won ? '🏆 Победа!' : 'Игра завершена',
          description: `+${earnedXP} XP · +${earnedKinetics} кинетиков`,
        });
      }
    },
    [character, refreshCharacter, toast]
  );

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">⚡</div>
          <p className="text-xl font-bold">Загрузка кинетической вселенной...</p>
          <p className="text-white/60 text-sm mt-2">Подготавливаем твои трюки</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-sm">
          <div className="text-6xl mb-4">🛹</div>
          <p className="text-xl font-bold mb-2">Персонаж не найден</p>
          <p className="text-white/60 text-sm mb-6">
            Создай своего первого персонажа и начни приключение
          </p>
          <Button
            className="bg-white text-purple-900 hover:bg-white/90 font-bold gap-2"
            onClick={() => navigate('/character-creation')}
          >
            <Icon name="Plus" size={16} />
            Создать персонажа
          </Button>
        </div>
      </div>
    );
  }

  // ── Action buttons config ──────────────────────────────────
  const actionButtons = [
    {
      label: 'Магазин',
      icon: 'ShoppingCart',
      emoji: '🛍️',
      color: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
      onClick: () => setShowShop(true),
    },
    {
      label: 'Игры',
      icon: 'Gamepad2',
      emoji: '🎮',
      color: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      onClick: () => setShowGames(true),
    },
    {
      label: 'Турниры',
      icon: 'Trophy',
      emoji: '🏆',
      color: 'from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600',
      onClick: () => setShowTournaments(true),
    },
    {
      label: character.is_pro ? 'PRO ✓' : 'PRO',
      icon: 'Crown',
      emoji: '👑',
      color: character.is_pro
        ? 'from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700'
        : 'from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800',
      onClick: () => setShowPro(true),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* ── Navigation ────────────────────────────────────── */}
      <Navigation currentPage="dashboard" />

      {/* ── Main content ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Top row: title + bell + kinetics ────────────── */}
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-xl sm:text-2xl font-black tracking-wide flex items-center gap-2">
              <span className="text-yellow-300">⚡</span>
              Кинетическая вселенная
            </h1>
            <p className="text-white/60 text-sm mt-0.5">
              Привет, {user?.name ?? character.name}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Kinetics balance pill */}
            <div className="bg-white/10 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/20">
              <span className="text-yellow-400 text-base">💰</span>
              <span className="text-white font-bold text-sm">{character.kinetics}</span>
            </div>
            {/* PRO badge */}
            {character.is_pro && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 border text-xs px-2">
                👑 PRO
              </Badge>
            )}
            {/* Notification bell */}
            <NotificationBell
              characterId={character.id}
              onKineticsUpdate={refreshCharacter}
            />
          </div>
        </div>

        {/* ── Character section ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Animated avatar */}
          <div className="flex flex-col items-center">
            <AnimatedCharacter
              sportType={character.sport_type}
              bodyType={character.body_type}
              hairstyle={character.hairstyle}
              hairColor={character.hair_color}
              name={character.name}
              level={character.level}
              avatarUrl={character.avatar_url}
              celebrating={celebrating}
            />

            {/* Quick XP bar under avatar */}
            <div className="w-full mt-3 bg-white/10 rounded-xl px-4 py-2">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Опыт</span>
                <span>{character.experience} / {getExperienceForNextLevel(character.level)}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-yellow-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (character.experience / getExperienceForNextLevel(character.level)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="lg:col-span-2">
            <CharacterInfoCard
              character={character}
              getExperienceForNextLevel={getExperienceForNextLevel}
            />
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actionButtons.map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className={`bg-gradient-to-br ${btn.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 font-semibold`}
            >
              <span className="text-3xl">{btn.emoji}</span>
              <span className="text-sm font-bold">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* ── Trick progress quick-bar ─────────────────────── */}
        {tricks.length > 0 && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-yellow-400" />
                  <span className="text-sm font-semibold">Прогресс трюков</span>
                </div>
                <span className="text-sm text-white/70">
                  {masteredTricks.length} / {tricks.length}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${getTrickProgress()}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1 text-right">
                {Math.round(getTrickProgress())}% освоено
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Tabs section ─────────────────────────────────── */}
        <KineticTabs
          character={character}
          characters={characters}
          tricks={tricks}
          getTricksByCategory={getTricksByCategory}
          isTrickMastered={isTrickMastered}
          getTrickProgress={getTrickProgress}
        />
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <KineticModals
        showShop={showShop}
        setShowShop={setShowShop}
        showGames={showGames}
        setShowGames={setShowGames}
        showTournaments={showTournaments}
        setShowTournaments={setShowTournaments}
        showPro={showPro}
        setShowPro={setShowPro}
        setActiveGame={setActiveGame}
        character={character}
        onCharacterUpdate={handleCharacterUpdate}
      />

      {/* ── Active games ─────────────────────────────────────── */}
      {activeGame === 'simulator' && (
        <TrickSimulator
          tricks={tricks}
          onComplete={(xp, kinetics, won) => handleGameComplete(xp, kinetics, won, 'simulator')}
          onClose={() => setActiveGame(null)}
        />
      )}

      {activeGame === 'arena' && (
        <TournamentArena
          tricks={tricks}
          character={character}
          onComplete={(xp, kinetics, won) => handleGameComplete(xp, kinetics, won, 'arena')}
          onClose={() => setActiveGame(null)}
        />
      )}

      {activeGame === 'cards' && (
        <CardBattle
          tricks={tricks}
          character={character}
          onComplete={(xp, kinetics, won) => handleGameComplete(xp, kinetics, won, 'cards')}
          onClose={() => setActiveGame(null)}
        />
      )}

      {/* ── Celebration overlay ──────────────────────────────── */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl px-12 py-8 text-center animate-bounce">
            <div className="text-6xl mb-2">🎉</div>
            <p className="text-white text-3xl font-black">Уровень {character.level}!</p>
            <p className="text-yellow-300 text-lg font-semibold mt-1">{character.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KineticUniverse;
