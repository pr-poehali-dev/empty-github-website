import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Character,
  Trick,
  Achievement,
  PublicProfile,
  SPORT_NAMES,
  SPORT_ICONS,
  CATEGORY_NAMES,
  DIFFICULTY_NAMES,
  DIFFICULTY_COLORS,
  SportType,
} from '@/types/kinetic';
import * as api from '@/services/kineticApi';
import PublicProfileModal from './PublicProfileModal';

interface KineticTabsProps {
  character: Character;
  characters: Character[];
  tricks: Trick[];
  getTricksByCategory: (category: string) => Trick[];
  isTrickMastered: (trickId: number) => boolean;
  getTrickProgress: () => number;
}

const KineticTabs = ({
  character,
  characters,
  tricks,
  getTricksByCategory,
  isTrickMastered,
  getTrickProgress,
}: KineticTabsProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [profileChar, setProfileChar] = useState<PublicProfile | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (character?.id) {
      api.getAchievements(character.id).then(setAchievements).catch(() => {});
    }
  }, [character?.id, character?.level, character?.experience]);

  const earnedCount = achievements.filter(a => a.is_earned).length;
  const totalCount = achievements.length;
  const sportTypes =
    character.sport_types?.length > 0 ? character.sport_types : [character.sport_type];

  const openProfile = async (charId: number) => {
    try {
      const p = await api.getPublicProfile(charId);
      setProfileChar(p);
      setShowProfile(true);
    } catch {
      // ignore
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU');

  const categories = Object.keys(CATEGORY_NAMES);
  const masteredTricks = tricks.filter(t => isTrickMastered(t.id));
  const progress = getTrickProgress();

  return (
    <>
      <Tabs defaultValue="tricks" className="space-y-4">
        <TabsList className="bg-white/90 flex-wrap h-auto gap-1">
          <TabsTrigger value="tricks">📖 Паспорт трюков</TabsTrigger>
          <TabsTrigger value="progress">📊 Прогресс</TabsTrigger>
          <TabsTrigger value="achievements">
            🏆 Достижения
            {totalCount > 0 && (
              <Badge className="ml-1 text-[10px] px-1 py-0 bg-yellow-500 text-white">
                {earnedCount}/{totalCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="characters">👥 Персонажи</TabsTrigger>
        </TabsList>

        {/* ── Tricks tab ─────────────────────────────────────────── */}
        <TabsContent value="tricks" className="space-y-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="BookOpen" size={18} />
                Паспорт трюков
              </CardTitle>
              <p className="text-sm text-gray-500">
                Освоено: {masteredTricks.length} из {tricks.length}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map(cat => {
                const catTricks = getTricksByCategory(cat);
                if (catTricks.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-gray-700">
                        {CATEGORY_NAMES[cat]}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {catTricks.filter(t => isTrickMastered(t.id)).length}/
                        {catTricks.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catTricks.map(trick => {
                        const mastered = isTrickMastered(trick.id);
                        return (
                          <div
                            key={trick.id}
                            className={`flex items-center justify-between rounded-lg p-3 border transition-all ${
                              mastered
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg">
                                {mastered ? '✅' : '⬜'}
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {trick.name}
                                </p>
                                <Badge
                                  className={`text-[10px] px-1 py-0 ${DIFFICULTY_COLORS[trick.difficulty]}`}
                                >
                                  {DIFFICULTY_NAMES[trick.difficulty]}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <p className="text-xs text-yellow-600 font-semibold">
                                +{trick.experience_reward} XP
                              </p>
                              <p className="text-xs text-cyan-600">
                                +{trick.kinetics_reward} к
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Progress tab ───────────────────────────────────────── */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="TrendingUp" size={18} />
                Прогресс
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Overall progress */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Общий прогресс трюков</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>

              {/* Per-category progress */}
              {categories.map(cat => {
                const catTricks = getTricksByCategory(cat);
                if (catTricks.length === 0) return null;
                const done = catTricks.filter(t => isTrickMastered(t.id)).length;
                const pct = Math.round((done / catTricks.length) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{CATEGORY_NAMES[cat]}</span>
                      <span>
                        {done}/{catTricks.length} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-purple-700">{character.level}</p>
                  <p className="text-xs text-gray-500">Уровень</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-yellow-700">{character.kinetics}</p>
                  <p className="text-xs text-gray-500">Кинетики</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-700">{masteredTricks.length}</p>
                  <p className="text-xs text-gray-500">Трюков</p>
                </div>
              </div>

              {/* Sports */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Виды спорта</p>
                <div className="flex flex-wrap gap-2">
                  {sportTypes.map((s: string) => (
                    <Badge key={s} variant="outline" className="text-sm">
                      {SPORT_ICONS[s as SportType] || '🏃'}{' '}
                      {SPORT_NAMES[s as SportType] || s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Achievements tab ───────────────────────────────────── */}
        <TabsContent value="achievements" className="space-y-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Trophy" size={18} />
                Достижения
                {totalCount > 0 && (
                  <Badge className="bg-yellow-500 text-white ml-1">
                    {earnedCount}/{totalCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Icon name="Trophy" size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Достижения загружаются...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map(a => (
                    <div
                      key={a.id}
                      className={`flex items-start gap-3 rounded-lg p-3 border transition-all ${
                        a.is_earned
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{a.icon || '🏆'}</span>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm ${a.is_earned ? 'text-gray-900' : 'text-gray-500'}`}>
                          {a.name || a.achievement_name}
                        </p>
                        {a.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                        )}
                        {a.is_earned && a.earned_at && (
                          <p className="text-[10px] text-green-600 mt-1">
                            ✅ {formatDate(a.earned_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Characters tab ─────────────────────────────────────── */}
        <TabsContent value="characters" className="space-y-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon name="Users" size={18} />
                Все персонажи ({characters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {characters.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Нет персонажей</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {characters.map(char => (
                    <div
                      key={char.id}
                      className={`rounded-lg border p-3 flex items-center gap-3 transition-all ${
                        char.id === character.id
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-gray-50 border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      {char.avatar_url ? (
                        <img
                          src={char.avatar_url}
                          alt={char.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-2xl border-2 border-white shadow">
                          {SPORT_ICONS[char.sport_type]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm truncate">{char.name}</p>
                          {char.id === character.id && (
                            <Badge className="text-[10px] px-1 py-0 bg-purple-500 text-white shrink-0">
                              Ты
                            </Badge>
                          )}
                          {char.is_pro && (
                            <Badge className="text-[10px] px-1 py-0 bg-yellow-500 text-white shrink-0">
                              PRO
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {SPORT_ICONS[char.sport_type]}{' '}
                          {SPORT_NAMES[char.sport_type] || char.sport_type} · Ур.{char.level}
                        </p>
                        <p className="text-xs text-yellow-600">💰 {char.kinetics}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs text-purple-600 hover:bg-purple-100"
                        onClick={() => openProfile(char.id)}
                      >
                        <Icon name="Eye" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inline public profile overlay */}
      {showProfile && profileChar && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProfile(false)}
        >
          <Card
            className="max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
              <CardTitle className="text-xl">Профиль</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(false)}
              >
                <Icon name="X" size={18} />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Identity */}
              <div className="flex items-center gap-4">
                {profileChar.character.avatar_url ? (
                  <img
                    src={profileChar.character.avatar_url}
                    alt={profileChar.character.name}
                    className="w-16 h-16 rounded-xl object-cover border-4 border-purple-400"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-3xl border-4 border-purple-400">
                    {SPORT_ICONS[profileChar.character.sport_type]}
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold">{profileChar.character.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge>Уровень {profileChar.character.level}</Badge>
                    <span className="text-yellow-600 text-sm font-semibold">
                      💰 {profileChar.character.kinetics}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tricks */}
              <div>
                <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Icon name="Star" size={14} />
                  Трюков освоено: {profileChar.mastered_tricks.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {profileChar.mastered_tricks.slice(0, 12).map(ct => (
                    <Badge key={ct.id} variant="secondary" className="text-xs">
                      {ct.trick?.name || `#${ct.trick_id}`}
                    </Badge>
                  ))}
                  {profileChar.mastered_tricks.length > 12 && (
                    <Badge variant="outline" className="text-xs text-gray-400">
                      +{profileChar.mastered_tricks.length - 12}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Achievements */}
              {profileChar.achievements.filter(a => a.is_earned).length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Icon name="Trophy" size={14} />
                    Достижения: {profileChar.achievements.filter(a => a.is_earned).length}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {profileChar.achievements
                      .filter(a => a.is_earned)
                      .slice(0, 8)
                      .map(a => (
                        <Badge key={a.id} className="bg-yellow-100 text-yellow-800 text-xs">
                          {a.icon || '🏆'} {a.name || a.achievement_name}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default KineticTabs;