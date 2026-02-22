import { useState, useEffect } from 'react';
import { SPORT_ICONS, SportType, HAIRSTYLES, BODY_TYPES, HAIR_COLORS } from '@/types/kinetic';
import { getAvatarForSport } from '@/services/kineticApi';

interface AnimatedCharacterProps {
  sportType: SportType;
  bodyType: number;
  hairstyle: number;
  hairColor: string;
  name?: string;
  level?: number;
  avatarUrl?: string;
  celebrating?: boolean;
}

const AnimatedCharacter = ({
  sportType,
  bodyType,
  hairstyle,
  hairColor,
  name,
  level = 1,
  avatarUrl,
  celebrating,
}: AnimatedCharacterProps) => {
  const avatar = avatarUrl || getAvatarForSport(sportType);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (celebrating) {
      setBounce(true);
      const t = setTimeout(() => setBounce(false), 2000);
      return () => clearTimeout(t);
    }
  }, [celebrating]);

  const hairstyleName = HAIRSTYLES.find(h => h.id === hairstyle)?.name || '';
  const bodyName = BODY_TYPES.find(b => b.id === bodyType)?.name || '';
  const colorName = HAIR_COLORS.find(c => c.value === hairColor)?.name || '';

  return (
    <div className="relative">
      <div
        className={`bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-6 border-4 border-purple-400 shadow-2xl ${
          celebrating ? 'animate-pulse' : ''
        }`}
      >
        <div className="relative flex flex-col items-center">
          {name && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-purple-400 z-10">
              <span className="font-bold text-purple-700">{name}</span>
            </div>
          )}

          <div className={`mb-4 mt-4 relative ${bounce ? 'animate-bounce' : ''}`}>
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-xl relative">
              <img
                src={avatar}
                alt={name || 'Персонаж'}
                className="w-full h-full object-cover"
              />
              {/* Hair color overlay strip */}
              <div
                className="absolute top-2 left-0 right-0 h-3 opacity-70"
                style={{ backgroundColor: hairColor }}
              />
            </div>

            {/* Level badge */}
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow">
              {level}
            </div>

            {/* Sport icon badge */}
            <div className="absolute -bottom-2 -left-2 bg-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-purple-400 shadow text-xl">
              {SPORT_ICONS[sportType]}
            </div>
          </div>

          {celebrating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl animate-ping">🎉</span>
            </div>
          )}

          <div className="text-4xl mt-2 animate-bounce">
            {SPORT_ICONS[sportType]}
          </div>
        </div>

        {/* Character traits */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
          {hairstyleName && (
            <div className="bg-white/80 rounded-lg p-1">
              <div className="font-semibold">Причёска</div>
              <div>{hairstyleName}</div>
            </div>
          )}
          {bodyName && (
            <div className="bg-white/80 rounded-lg p-1">
              <div className="font-semibold">Телосложение</div>
              <div>{bodyName}</div>
            </div>
          )}
          {colorName && (
            <div className="bg-white/80 rounded-lg p-1">
              <div className="font-semibold">Цвет волос</div>
              <div className="flex items-center justify-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: hairColor }}
                />
                {colorName}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedCharacter;
