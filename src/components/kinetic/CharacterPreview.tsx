import { SPORT_ICONS, SportType } from '@/types/kinetic';
import { getAvatarForSport } from '@/services/kineticApi';

interface CharacterPreviewProps {
  sportType: SportType;
  bodyType: number;
  hairstyle: number;
  hairColor: string;
  name?: string;
  level?: number;
  avatarUrl?: string;
}

const CharacterPreview = ({
  sportType,
  hairColor,
  name,
  level = 1,
  avatarUrl,
}: CharacterPreviewProps) => {
  const avatar = avatarUrl || getAvatarForSport(sportType);

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-6 border-4 border-purple-400 shadow-2xl">
        <div className="relative flex flex-col items-center">
          {name && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-purple-400 z-10">
              <span className="font-bold text-purple-700">{name}</span>
            </div>
          )}

          <div className="mb-4 mt-4 relative">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl relative">
              <img
                src={avatar}
                alt={name || 'Персонаж'}
                className="w-full h-full object-cover"
              />
              {/* Hair color strip */}
              <div
                className="absolute top-2 left-0 right-0 h-3 opacity-60"
                style={{ backgroundColor: hairColor }}
              />
            </div>

            {/* Level badge */}
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow">
              {level}
            </div>
          </div>

          <div className="text-5xl animate-bounce">
            {SPORT_ICONS[sportType]}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/80 rounded-lg p-2">
            <div className="text-2xl">⚖️</div>
            <div className="text-xs font-semibold">Баланс</div>
          </div>
          <div className="bg-white/80 rounded-lg p-2">
            <div className="text-2xl">⚡</div>
            <div className="text-xs font-semibold">Скорость</div>
          </div>
          <div className="bg-white/80 rounded-lg p-2">
            <div className="text-2xl">🔥</div>
            <div className="text-xs font-semibold">Смелость</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPreview;
