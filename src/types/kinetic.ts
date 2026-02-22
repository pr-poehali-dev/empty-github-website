export type SportType = 'skate' | 'rollers' | 'bmx' | 'scooter' | 'bike';

export const SPORT_ICONS: Record<string, string> = {
  skate: '🛹',
  rollers: '🛼',
  bmx: '🚴‍♂️',
  scooter: '🛴',
  bike: '🚲',
};

export const SPORT_NAMES: Record<string, string> = {
  skate: 'Скейтбординг',
  rollers: 'Ролики',
  bmx: 'BMX',
  scooter: 'Трюковой самокат',
  bike: 'Велосипед',
};

export const CATEGORY_NAMES: Record<string, string> = {
  balance: '⚖️ Баланс',
  spins: '🌀 Вращения',
  jumps: '⬆️ Прыжки',
  slides: '🛤️ Слайды',
  flips: '🔄 Флипы',
};

export const DIFFICULTY_NAMES: Record<string, string> = {
  novice: 'Новичок',
  amateur: 'Любитель',
  pro: 'Профи',
  legend: 'Легенда',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  novice: 'bg-green-100 text-green-800',
  amateur: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  legend: 'bg-yellow-100 text-yellow-800',
};

export const HAIRSTYLES = [
  { id: 1, name: 'Классика' },
  { id: 2, name: 'Ирокез' },
  { id: 3, name: 'Косички' },
  { id: 4, name: 'Короткий' },
  { id: 5, name: 'Длинный' },
];

export const BODY_TYPES = [
  { id: 1, name: 'Стандарт' },
  { id: 2, name: 'Атлет' },
  { id: 3, name: 'Худощавый' },
  { id: 4, name: 'Крепкий' },
  { id: 5, name: 'Высокий' },
];

export const HAIR_COLORS = [
  { value: '#1a1a1a', name: 'Чёрный' },
  { value: '#8B4513', name: 'Коричневый' },
  { value: '#FFD700', name: 'Золотой' },
  { value: '#FF6B6B', name: 'Красный' },
  { value: '#4ECDC4', name: 'Бирюзовый' },
  { value: '#9B59B6', name: 'Фиолетовый' },
];
export type RidingStyle = 'aggressive' | 'technical' | 'freestyle';
export type TrickCategory = 'balance' | 'spins' | 'jumps' | 'slides' | 'flips';
export type TrickDifficulty = 'novice' | 'amateur' | 'pro' | 'legend';
export type ItemType = 'outfit' | 'equipment' | 'booster' | 'animation' | 'accessory';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Character {
  id: number;
  user_id: string;
  name: string;
  sport_type: SportType;
  sport_types: string[];
  riding_style: RidingStyle;
  level: number;
  experience: number;
  balance: number;
  speed: number;
  courage: number;
  body_type: number;
  hairstyle: number;
  hair_color: string;
  avatar_url?: string;
  outfit_id?: number;
  kinetics: number;
  premium_currency: number;
  is_pro: boolean;
  pro_expires_at?: string;
  games_won: number;
  games_played: number;
  age?: number;
  trainer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Trick {
  id: number;
  name: string;
  sport_type: SportType;
  category: TrickCategory;
  difficulty: TrickDifficulty;
  experience_reward: number;
  kinetics_reward: number;
  description?: string;
  created_at: string;
}

export interface CharacterTrick {
  id: number;
  character_id: number;
  trick_id: number;
  confirmed_by?: string;
  confirmed_at: string;
  trick?: Trick;
}

export interface PurchasedItem {
  id: number;
  character_id: number;
  item_type: string;
  item_value: string;
  item_name: string;
  cost: number;
  purchased_at: string;
}

export interface InventoryItem {
  id: number;
  character_id: number;
  item_type: ItemType;
  item_name: string;
  item_rarity?: ItemRarity;
  stats?: Record<string, unknown>;
  is_equipped: boolean;
  acquired_at: string;
}

export interface KineticsTransaction {
  id: number;
  character_id: number;
  amount: number;
  transaction_type: 'earn' | 'spend';
  source: string;
  description?: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  character_id: number;
  achievement_type: string;
  achievement_name: string;
  name?: string;
  icon?: string;
  description?: string;
  is_earned?: boolean;
  earned_at?: string;
}

export interface CharacterNotification {
  id: number;
  character_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface Tournament {
  id: number;
  name: string;
  sport_type?: SportType;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  prize_pool: number;
  entry_fee: number;
  max_participants?: number;
  description?: string;
  created_at: string;
}

export interface TournamentEntry {
  id: number;
  tournament_id: number;
  character_id: number;
  score: number;
  rank?: number;
  prize_earned?: number;
  joined_at: string;
  character?: Character;
}

export interface TrainingVisit {
  id: number;
  character_id: number;
  trainer_name?: string;
  sport_type?: SportType;
  notes?: string;
  xp_gained: number;
  kinetics_gained: number;
  visited_at: string;
}

export interface PublicProfile {
  character: Character;
  mastered_tricks: CharacterTrick[];
  achievements: Achievement[];
  tournament_entries: TournamentEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  character: Character;
  score: number;
}