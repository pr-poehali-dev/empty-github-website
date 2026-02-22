import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  SportType,
  RidingStyle,
  SPORT_NAMES,
  SPORT_ICONS,
  BODY_TYPES,
  HAIRSTYLES,
  HAIR_COLORS,
} from '@/types/kinetic';
import CharacterPreview from '@/components/kinetic/CharacterPreview';
import { createCharacter } from '@/services/kineticApi';

// Not exported from types, defined locally
const RIDING_STYLE_NAMES: Record<RidingStyle, string> = {
  aggressive: '💥 Агрессивный',
  technical: '🔧 Технический',
  freestyle: '🎨 Фристайл',
};

const RIDING_STYLE_DESCRIPTIONS: Record<RidingStyle, string> = {
  aggressive: 'Максимальная скорость и смелость, акцент на прыжки и трюки',
  technical: 'Точность и контроль, сложные технические элементы',
  freestyle: 'Творческий подход, комбинации трюков и стиль',
};

const SPORT_DESCRIPTIONS: Record<SportType, string> = {
  skate: 'Классический скейтбординг — доска, дорожки и паркуры',
  rollers: 'Агрессивные ролики — рампы, рейлы и улицы',
  bmx: 'BMX-велосипед — стандарт уличного экстрима',
  scooter: 'Трюковой самокат — молодой и динамичный вид спорта',
  bike: 'Горный или трюковой велосипед — разнообразие трюков',
};

const TOTAL_STEPS = 4;

const CharacterCreation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [characterName, setCharacterName] = useState('');
  const [characterAge, setCharacterAge] = useState('');
  const [sportType, setSportType] = useState<SportType | ''>('');
  const [ridingStyle, setRidingStyle] = useState<RidingStyle | ''>('');
  const [bodyType, setBodyType] = useState(1);
  const [hairstyle, setHairstyle] = useState(1);
  const [hairColor, setHairColor] = useState('#1a1a1a');

  // ── Navigation helpers ─────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return sportType !== '';
    if (step === 2) return ridingStyle !== '';
    if (step === 3) return true; // appearance always valid
    if (step === 4) return characterName.trim().length >= 2;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({ title: 'Сделайте выбор', description: 'Выберите вариант перед продолжением', variant: 'destructive' });
      return;
    }
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleCreateCharacter();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else navigate('/');
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleCreateCharacter = async () => {
    if (!characterName.trim() || !sportType || !ridingStyle) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }
    if (!user?.id) {
      toast({ title: 'Ошибка', description: 'Необходимо войти в систему', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem('current_user');
      const userAge = storedUser ? JSON.parse(storedUser).age : undefined;
      const ageNum = characterAge ? parseInt(characterAge, 10) : userAge;

      await createCharacter({
        user_id: user.id,
        name: characterName.trim(),
        sport_type: sportType,
        riding_style: ridingStyle,
        body_type: bodyType,
        hairstyle,
        hair_color: hairColor,
        age: ageNum || undefined,
      });

      toast({
        title: '🎉 Персонаж создан!',
        description: `${characterName} готов к приключениям!`,
      });
      navigate('/kinetic-universe');
    } catch (err) {
      toast({
        title: 'Ошибка создания',
        description: err instanceof Error ? err.message : 'Попробуйте ещё раз',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step label map ─────────────────────────────────────────
  const stepLabels = ['Спорт', 'Стиль', 'Внешность', 'Имя'];
  const stepIcons = ['Skateboarding', 'Flame', 'Palette', 'User'];

  // ── Preview props (safe defaults) ─────────────────────────
  const previewSport: SportType = (sportType as SportType) || 'skate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Top bar */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">⚡</span>
            <span className="font-black text-white text-lg tracking-wide">
              KINETIC <span className="text-yellow-300">KIDS</span>
            </span>
          </button>
          <span className="text-white/60 text-sm hidden sm:block">Создание персонажа</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {stepLabels.map((label, idx) => {
              const num = idx + 1;
              const done = num < step;
              const active = num === step;
              return (
                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    done ? 'bg-green-500 border-green-500 text-white' :
                    active ? 'bg-white border-white text-purple-900' :
                    'bg-white/10 border-white/30 text-white/40'
                  }`}>
                    {done ? <Icon name="Check" size={16} /> : num}
                  </div>
                  <span className={`text-xs hidden sm:block transition-colors ${
                    active ? 'text-white font-semibold' : done ? 'text-green-400' : 'text-white/40'
                  }`}>
                    {label}
                  </span>
                  {/* Connector */}
                  {idx < stepLabels.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              );
            })}
          </div>
          {/* Progress line */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-1">
            <div
              className="bg-gradient-to-r from-purple-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Main layout: form + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Form panel ─────────────────────────────────── */}
          <div className="lg:col-span-3">
            <Card className="bg-white/95 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Icon name={stepIcons[step - 1]} size={20} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {step === 1 && 'Выбери вид спорта'}
                      {step === 2 && 'Выбери стиль катания'}
                      {step === 3 && 'Настрой внешность'}
                      {step === 4 && 'Назови своего героя'}
                    </CardTitle>
                    <CardDescription>
                      {step === 1 && 'Это определит твои трюки и способности'}
                      {step === 2 && 'Стиль влияет на начальные характеристики'}
                      {step === 3 && 'Персонализируй своего персонажа'}
                      {step === 4 && 'Придумай уникальное имя'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* ── STEP 1: Sport ── */}
                {step === 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(SPORT_NAMES) as SportType[]).map(sport => (
                      <button
                        key={sport}
                        onClick={() => setSportType(sport)}
                        className={`relative text-left rounded-xl border-2 p-4 transition-all hover:shadow-md group ${
                          sportType === sport
                            ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-200'
                        }`}
                      >
                        {sportType === sport && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <Icon name="Check" size={12} className="text-white" />
                          </div>
                        )}
                        <div className="text-4xl mb-2">{SPORT_ICONS[sport]}</div>
                        <div className="font-bold text-gray-900">{SPORT_NAMES[sport]}</div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {SPORT_DESCRIPTIONS[sport]}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* ── STEP 2: Riding style ── */}
                {step === 2 && (
                  <div className="space-y-3">
                    {(Object.keys(RIDING_STYLE_NAMES) as RidingStyle[]).map(style => (
                      <button
                        key={style}
                        onClick={() => setRidingStyle(style)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md flex items-center gap-4 ${
                          ridingStyle === style
                            ? 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          style === 'aggressive' ? 'bg-red-100' :
                          style === 'technical' ? 'bg-blue-100' :
                          'bg-green-100'
                        }`}>
                          {style === 'aggressive' ? '💥' : style === 'technical' ? '🔧' : '🎨'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900">{RIDING_STYLE_NAMES[style]}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{RIDING_STYLE_DESCRIPTIONS[style]}</div>
                          {/* Stat hints */}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {style === 'aggressive' && (
                              <>
                                <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200">+Скорость</Badge>
                                <Badge className="text-[10px] bg-orange-100 text-orange-700 border-orange-200">+Смелость</Badge>
                              </>
                            )}
                            {style === 'technical' && (
                              <>
                                <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200">+Баланс</Badge>
                                <Badge className="text-[10px] bg-cyan-100 text-cyan-700 border-cyan-200">+Точность</Badge>
                              </>
                            )}
                            {style === 'freestyle' && (
                              <>
                                <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">+Стиль</Badge>
                                <Badge className="text-[10px] bg-purple-100 text-purple-700 border-purple-200">+Универсальность</Badge>
                              </>
                            )}
                          </div>
                        </div>
                        {ridingStyle === style && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                            <Icon name="Check" size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── STEP 3: Appearance ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Body type */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Телосложение
                      </Label>
                      <div className="grid grid-cols-5 gap-2">
                        {BODY_TYPES.map(bt => (
                          <button
                            key={bt.id}
                            onClick={() => setBodyType(bt.id)}
                            className={`rounded-lg border-2 py-2 px-1 text-center text-xs font-medium transition-all ${
                              bodyType === bt.id
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-600 hover:border-purple-200'
                            }`}
                          >
                            <div className="text-xl mb-1">
                              {bt.id === 1 ? '🧍' : bt.id === 2 ? '💪' : bt.id === 3 ? '🏃' : bt.id === 4 ? '🏋️' : '🗼'}
                            </div>
                            {bt.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hairstyle */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Причёска
                      </Label>
                      <div className="grid grid-cols-5 gap-2">
                        {HAIRSTYLES.map(h => (
                          <button
                            key={h.id}
                            onClick={() => setHairstyle(h.id)}
                            className={`rounded-lg border-2 py-2 px-1 text-center text-xs font-medium transition-all ${
                              hairstyle === h.id
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-600 hover:border-purple-200'
                            }`}
                          >
                            <div className="text-xl mb-1">
                              {h.id === 1 ? '💇' : h.id === 2 ? '🦔' : h.id === 3 ? '👩‍🦱' : h.id === 4 ? '👦' : '🧑‍🦲'}
                            </div>
                            {h.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hair color */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Цвет волос
                      </Label>
                      <div className="flex gap-3 flex-wrap">
                        {HAIR_COLORS.map(color => (
                          <button
                            key={color.value}
                            onClick={() => setHairColor(color.value)}
                            title={color.name}
                            className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                              hairColor === color.value
                                ? 'border-purple-500 scale-110 shadow-lg'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            style={{ backgroundColor: color.value }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Выбрано: <span className="font-medium">{HAIR_COLORS.find(c => c.value === hairColor)?.name}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Name & age ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="char-name" className="text-sm font-semibold">
                        Имя персонажа <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="char-name"
                        placeholder="Например: Стремительный Макс"
                        value={characterName}
                        onChange={e => setCharacterName(e.target.value)}
                        maxLength={32}
                        className="text-base"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter' && canProceed()) handleNext(); }}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-gray-500">Минимум 2 символа</p>
                        <p className="text-xs text-gray-400">{characterName.length}/32</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="char-age" className="text-sm font-semibold">
                        Возраст <span className="text-gray-400 font-normal">(необязательно)</span>
                      </Label>
                      <Input
                        id="char-age"
                        type="number"
                        placeholder="Например: 14"
                        value={characterAge}
                        onChange={e => setCharacterAge(e.target.value)}
                        min={5}
                        max={99}
                        className="text-base"
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-semibold text-purple-800 mb-3">Твой персонаж:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🏅</span>
                          <span><strong>Спорт:</strong> {sportType ? SPORT_NAMES[sportType] : '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🎯</span>
                          <span><strong>Стиль:</strong> {ridingStyle ? RIDING_STYLE_NAMES[ridingStyle] : '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🏋️</span>
                          <span><strong>Тело:</strong> {BODY_TYPES.find(b => b.id === bodyType)?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>💇</span>
                          <span><strong>Причёска:</strong> {HAIRSTYLES.find(h => h.id === hairstyle)?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Nav buttons ── */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    <Icon name="ArrowLeft" size={16} />
                    {step === 1 ? 'На главную' : 'Назад'}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2 font-semibold"
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" size={16} className="animate-spin" />
                        Создаём...
                      </>
                    ) : step < TOTAL_STEPS ? (
                      <>
                        Далее
                        <Icon name="ArrowRight" size={16} />
                      </>
                    ) : (
                      <>
                        <Icon name="Sparkles" size={16} />
                        Создать персонажа!
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Preview panel ─────────────────────────────── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <div className="text-center mb-4">
              <p className="text-white/70 text-sm font-medium">Предпросмотр персонажа</p>
            </div>
            <CharacterPreview
              sportType={previewSport}
              bodyType={bodyType}
              hairstyle={hairstyle}
              hairColor={hairColor}
              name={characterName || undefined}
              level={1}
            />

            {/* Info hints below preview */}
            <div className="mt-4 space-y-2">
              {sportType && (
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 flex items-center gap-3">
                  <span className="text-2xl">{SPORT_ICONS[sportType]}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{SPORT_NAMES[sportType]}</p>
                    {ridingStyle && (
                      <p className="text-white/60 text-xs">{RIDING_STYLE_NAMES[ridingStyle]}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-center">
                <p className="text-white/50 text-xs">
                  Шаг {step} из {TOTAL_STEPS}
                </p>
                <p className="text-white text-sm font-medium mt-0.5">{stepLabels[step - 1]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;
