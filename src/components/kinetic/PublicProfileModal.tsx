import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { PublicProfile, SPORT_NAMES, SPORT_ICONS, SportType } from '@/types/kinetic';
import * as api from '@/services/kineticApi';

interface PublicProfileModalProps {
  characterId: number;
  onClose: () => void;
}

const PublicProfileModal = ({ characterId, onClose }: PublicProfileModalProps) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPublicProfile(characterId)
      .then(p => {
        setProfile(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [characterId]);

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="text-white text-xl flex items-center gap-3">
          <Icon name="Loader2" size={24} className="animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const { character: c, mastered_tricks, achievements, tournament_entries } = profile;
  const sports =
    c.sport_types && c.sport_types.length > 0 ? c.sport_types : [c.sport_type];

  const earnedAchievements = achievements.filter(a => a.is_earned);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b">
          <CardTitle className="text-2xl">Профиль</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Header: avatar + name + sports */}
          <div className="flex items-center gap-4">
            {c.avatar_url ? (
              <img
                src={c.avatar_url}
                alt={c.name}
                className="w-20 h-20 rounded-xl object-cover border-4 border-purple-400 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-4xl border-4 border-purple-400 shadow-lg">
                {SPORT_ICONS[c.sport_type]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold truncate">{c.name}</h2>
              <div className="flex gap-1 flex-wrap mt-1">
                {sports.map((s: string) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {SPORT_ICONS[s as SportType] || '🏃'}{' '}
                    {SPORT_NAMES[s as SportType] || s}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                <span>
                  <Badge className="text-sm">Уровень {c.level}</Badge>
                </span>
                <span className="text-yellow-600 font-semibold">💰 {c.kinetics}</span>
                {c.is_pro && (
                  <Badge className="bg-yellow-500 text-white text-xs">PRO</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Баланс', value: c.balance, icon: '⚖️', color: 'bg-blue-400' },
              { label: 'Скорость', value: c.speed, icon: '⚡', color: 'bg-yellow-400' },
              { label: 'Смелость', value: c.courage, icon: '🔥', color: 'bg-red-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`${stat.color} h-1.5 rounded-full`}
                    style={{ width: `${Math.min(100, stat.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra info */}
          {(c.trainer_name || c.age || c.riding_style) && (
            <div className="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-4 text-sm text-gray-600">
              {c.trainer_name && (
                <span>👨‍🏫 Тренер: <strong>{c.trainer_name}</strong></span>
              )}
              {c.age && (
                <span>📅 Возраст: <strong>{c.age}</strong></span>
              )}
              {c.riding_style && (
                <span>
                  🎯 Стиль:{' '}
                  <strong>
                    {c.riding_style === 'aggressive'
                      ? '💥 Агрессивный'
                      : c.riding_style === 'technical'
                      ? '🔧 Технический'
                      : '🎨 Фристайл'}
                  </strong>
                </span>
              )}
              <span>🎮 Игр: <strong>{c.games_played}</strong></span>
              <span>🏆 Побед: <strong>{c.games_won}</strong></span>
            </div>
          )}

          {/* Mastered tricks */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Icon name="Star" size={16} />
              Освоенные трюки ({mastered_tricks.length})
            </h3>
            {mastered_tricks.length === 0 ? (
              <p className="text-sm text-gray-400">Трюки ещё не освоены</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {mastered_tricks.slice(0, 15).map(ct => (
                  <Badge key={ct.id} variant="secondary" className="text-xs">
                    {ct.trick?.name || `Трюк #${ct.trick_id}`}
                  </Badge>
                ))}
                {mastered_tricks.length > 15 && (
                  <Badge variant="outline" className="text-xs text-gray-400">
                    +{mastered_tricks.length - 15} ещё
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Achievements */}
          {earnedAchievements.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon name="Trophy" size={16} />
                Достижения ({earnedAchievements.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {earnedAchievements.slice(0, 10).map(a => (
                  <Badge key={a.id} className="bg-yellow-100 text-yellow-800 text-xs">
                    {a.icon || '🏆'} {a.name || a.achievement_name}
                  </Badge>
                ))}
                {earnedAchievements.length > 10 && (
                  <Badge variant="outline" className="text-xs text-gray-400">
                    +{earnedAchievements.length - 10} ещё
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tournaments */}
          {tournament_entries.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon name="Medal" size={16} />
                Турниры ({tournament_entries.length})
              </h3>
              <div className="space-y-2">
                {tournament_entries.slice(0, 5).map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="text-gray-700">
                      {entry.rank ? `#${entry.rank}` : '—'} место
                    </span>
                    <span className="font-semibold">{entry.score} очков</span>
                    {entry.prize_earned != null && entry.prize_earned > 0 && (
                      <span className="text-yellow-600 font-semibold">
                        💰 {entry.prize_earned}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicProfileModal;
