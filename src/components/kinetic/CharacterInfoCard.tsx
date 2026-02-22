import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character, SPORT_NAMES, SPORT_ICONS, SportType } from '@/types/kinetic';

interface CharacterInfoCardProps {
  character: Character;
  getExperienceForNextLevel: (level: number) => number;
}

const CharacterInfoCard = ({ character, getExperienceForNextLevel }: CharacterInfoCardProps) => {
  const sports =
    character.sport_types && character.sport_types.length > 0
      ? character.sport_types
      : [character.sport_type];

  const xpForNext = getExperienceForNextLevel(character.level);
  const xpProgress = xpForNext > 0 ? Math.min(100, Math.round((character.experience / xpForNext) * 100)) : 100;

  const statBar = (label: string, value: number, icon: string, color: string) => (
    <div className="flex items-center gap-2">
      <span className="text-base w-6 text-center">{icon}</span>
      <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value}</span>
    </div>
  );

  return (
    <Card className="lg:col-span-2 bg-white/95 backdrop-blur-md">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: identity */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">{SPORT_ICONS[character.sport_type]}</div>
              <div>
                <div className="text-2xl font-bold">{character.name}</div>
                <div className="flex gap-1 flex-wrap mt-1">
                  {sports.map((s: string) => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {SPORT_ICONS[s as SportType] || '🏃'}{' '}
                      {SPORT_NAMES[s as SportType] || s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="text-lg px-3 py-1">Уровень {character.level}</Badge>
              <span className="text-lg font-semibold text-yellow-600">
                💰 {character.kinetics}
              </span>
              {character.is_pro && (
                <Badge className="bg-yellow-500 text-white text-xs">PRO</Badge>
              )}
            </div>

            {(character.trainer_name || character.age) && (
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-2 flex-wrap">
                {character.trainer_name && (
                  <span>
                    👨‍🏫 Тренер: <strong>{character.trainer_name}</strong>
                  </span>
                )}
                {character.age && (
                  <span>
                    📅 Возраст: <strong>{character.age}</strong>
                  </span>
                )}
              </div>
            )}

            {/* XP progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Опыт: {character.experience} / {xpForNext}</span>
                <span>{xpProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>

            {/* Games stats */}
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>
                🎮 Игр: <strong>{character.games_played}</strong>
              </span>
              <span>
                🏆 Побед: <strong>{character.games_won}</strong>
              </span>
            </div>
          </div>

          {/* Right: stats */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">Характеристики</div>
            {statBar('Баланс', character.balance, '⚖️', 'bg-blue-400')}
            {statBar('Скорость', character.speed, '⚡', 'bg-yellow-400')}
            {statBar('Смелость', character.courage, '🔥', 'bg-red-400')}

            {/* Riding style */}
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Стиль катания</div>
              <div className="font-semibold text-gray-800 capitalize">
                {character.riding_style === 'aggressive'
                  ? '💥 Агрессивный'
                  : character.riding_style === 'technical'
                  ? '🔧 Технический'
                  : '🎨 Фристайл'}
              </div>
            </div>

            {/* Premium currency */}
            {character.premium_currency > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 flex items-center gap-2">
                <span className="text-lg">💎</span>
                <div>
                  <div className="text-xs text-gray-500">Премиум монеты</div>
                  <div className="font-bold text-yellow-700">{character.premium_currency}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterInfoCard;
