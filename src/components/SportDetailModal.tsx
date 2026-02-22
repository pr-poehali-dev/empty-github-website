import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface SportDetails {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
  fullDescription?: string;
  forWho?: string;
  benefits?: string[];
  develops?: string[];
}

interface SportDetailModalProps {
  sport: SportDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const sportDetailsData: Record<string, Omit<SportDetails, 'id' | 'color'> & { fullDescription: string; forWho: string; benefits: string[]; develops: string[] }> = {
  skate: {
    name: 'Скейтбординг',
    icon: '🛹',
    description: 'Изучаем основы катания, повороты, торможение и первые трюки',
    fullDescription:
      'Скейтбординг — это не просто катание на доске, это целая культура и образ жизни. Мы учим детей основам балансировки, правильной стойке, безопасному катанию и постепенно переходим к освоению трюков. Наши тренеры — опытные скейтеры, которые знают, как вдохновить начинающего.',
    forWho:
      'Для детей от 5 лет и взрослых. Подходит как для начинающих, так и для тех, кто хочет улучшить технику.',
    benefits: [
      'Развитие координации и баланса',
      'Укрепление мышц ног и корпуса',
      'Повышение уверенности в себе',
      'Развитие креативности',
      'Улучшение концентрации внимания',
    ],
    develops: [
      'Физическую выносливость',
      'Смелость и решительность',
      'Пространственное мышление',
      'Умение преодолевать страхи',
      'Социальные навыки',
    ],
  },
  roller: {
    name: 'Ролики',
    icon: '🛼',
    description: 'От первых шагов до слалома и фристайла',
    fullDescription:
      'Катание на роликах — универсальный вид спорта, который подходит всем. От базовых навыков катания до агрессивных роликов и фристайла — у нас есть программы для любого уровня подготовки.',
    forWho: 'Для детей от 4 лет и взрослых без ограничений по возрасту.',
    benefits: [
      'Развитие равновесия и координации',
      'Укрепление ног и ягодиц',
      'Кардио-тренировка',
      'Улучшение осанки',
      'Снятие стресса',
    ],
    develops: [
      'Гибкость и пластику',
      'Чувство ритма',
      'Настойчивость',
      'Командный дух',
      'Скоростные качества',
    ],
  },
  bike: {
    name: 'Велосипед',
    icon: '🚲',
    description: 'Безопасная езда, трюки и велопрогулки',
    fullDescription:
      'Велосипед — классика, которая никогда не устареет. Мы учим детей правильной технике езды, безопасному поведению на дороге и базовым трюкам. Занятия проходят в безопасной закрытой среде.',
    forWho: 'Для детей от 4 лет. Принимаем детей без навыков езды.',
    benefits: [
      'Гармоничное физическое развитие',
      'Укрепление сердечно-сосудистой системы',
      'Развитие ловкости и реакции',
      'Воспитание самостоятельности',
      'Закалка характера',
    ],
    develops: [
      'Координацию движений',
      'Ответственность',
      'Умение ориентироваться в пространстве',
      'Физическую силу',
      'Уверенность в себе',
    ],
  },
  bmx: {
    name: 'BMX',
    icon: '🚴‍♂️',
    description: 'Экстремальная езда, джампы и трюки на рампе',
    fullDescription:
      'BMX — это адреналин, трюки и свобода! Мы обучаем катанию в скейт-парке, прыжкам на рампах и освоению базовых трюков. Всё обучение происходит поэтапно и максимально безопасно.',
    forWho: 'Для детей от 6 лет, которые любят активный спорт и не боятся скорости.',
    benefits: [
      'Развитие смелости и решительности',
      'Сильные ноги и корпус',
      'Отличная координация',
      'Навыки реакции',
      'Умение управлять страхом',
    ],
    develops: [
      'Экстремальные навыки',
      'Умение рассчитывать риски',
      'Физическую силу',
      'Настойчивость',
      'Спортивный характер',
    ],
  },
  scooter: {
    name: 'Трюковой самокат',
    icon: '🛴',
    description: 'Современный городской экстрим и воздушные трюки',
    fullDescription:
      'Трюковой самокат — один из самых популярных видов спорта среди молодёжи. Динамичный, зрелищный и доступный. Мы обучаем от базового катания до сложных трюков в скейт-парке.',
    forWho: 'Для детей от 5 лет. Особенно популярен среди детей 8–16 лет.',
    benefits: [
      'Развитие координации',
      'Укрепление мышц',
      'Повышение самооценки',
      'Развитие творческого мышления',
      'Социализация в сообществе',
    ],
    develops: [
      'Чувство баланса',
      'Пространственное мышление',
      'Смелость',
      'Физическую форму',
      'Командный дух',
    ],
  },
  runbike: {
    name: 'Беговел',
    icon: '🏃‍♂️',
    description: 'Первые шаги к освоению равновесия для самых маленьких',
    fullDescription:
      'Беговел — идеальный первый транспорт для малышей. Он помогает освоить баланс и стать уверенным в движении. После беговела дети гораздо легче и быстрее учатся ездить на велосипеде.',
    forWho: 'Для малышей от 3 лет. Идеально для тех, кто только начинает своё знакомство с колёсным спортом.',
    benefits: [
      'Развитие чувства равновесия',
      'Укрепление ног',
      'Развитие координации движений',
      'Уверенность в себе',
      'Подготовка к велосипеду',
    ],
    develops: [
      'Базовые моторные навыки',
      'Самостоятельность',
      'Пространственное восприятие',
      'Физическую активность',
      'Смелость',
    ],
  },
};

export default function SportDetailModal({ sport, isOpen, onClose }: SportDetailModalProps) {
  const { toast } = useToast();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!sport) return null;

  // Merge base sport data with detailed data
  const details = sportDetailsData[sport.id] || {
    name: sport.name,
    icon: sport.icon,
    description: sport.description,
    fullDescription: sport.description,
    forWho: 'Для детей и взрослых',
    benefits: ['Физическое развитие', 'Координация', 'Уверенность'],
    develops: ['Смелость', 'Выносливость', 'Ловкость'],
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      toast({ title: 'Заполните имя и телефон', variant: 'destructive' });
      return;
    }
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    toast({
      title: '✅ Заявка отправлена!',
      description: 'Наш тренер свяжется с вами в ближайшее время',
    });
    setContactName('');
    setContactPhone('');
    setContactMessage('');
    onClose();
  };

  const gradientMap: Record<string, string> = {
    skate: 'from-red-500 to-orange-500',
    roller: 'from-blue-500 to-cyan-500',
    bike: 'from-green-500 to-emerald-500',
    bmx: 'from-orange-500 to-amber-500',
    scooter: 'from-purple-500 to-pink-500',
    runbike: 'from-teal-500 to-cyan-500',
  };
  const gradient = gradientMap[sport.id] || 'from-orange-500 to-red-500';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hero banner */}
        <div className={`bg-gradient-to-r ${gradient} text-white px-6 py-8 rounded-t-lg`}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">{details.icon}</span>
              <div>
                <DialogTitle className="text-3xl font-black text-white">
                  {details.name}
                </DialogTitle>
                <p className="text-white/80 text-sm mt-1">{details.description}</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Full description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Icon name="Info" size={18} className="text-orange-500" />
              О направлении
            </h3>
            <p className="text-gray-600 leading-relaxed">{details.fullDescription}</p>
          </div>

          {/* For who */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="text-lg">👥</span>
              Для кого подходит
            </h3>
            <p className="text-gray-700 text-sm">{details.forWho}</p>
          </div>

          {/* Benefits + Develops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Star" size={16} className="text-yellow-500" />
                Польза для ребёнка
              </h3>
              <ul className="space-y-1.5">
                {details.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="TrendingUp" size={16} className="text-blue-500" />
                Развивает
              </h3>
              <ul className="space-y-1.5">
                {details.develops.map((dev, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                    {dev}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Price teaser */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Стоимость</p>
              <p className="text-xl font-black">от 2 500 ₽<span className="text-white/60 text-sm font-normal">/месяц</span></p>
            </div>
            <Badge className="bg-green-500 text-white border-0 text-sm px-3 py-1">
              🎯 Пробное — бесплатно!
            </Badge>
          </div>

          {/* Contact form */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="Phone" size={18} className="text-orange-500" />
              Записаться на занятие
            </h3>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="contact-name" className="text-sm">
                    Имя <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Ваше имя"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    disabled={sending}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-phone" className="text-sm">
                    Телефон <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-phone"
                    placeholder="+7 (___) ___-__-__"
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    disabled={sending}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="contact-msg" className="text-sm">
                  Сообщение <span className="text-gray-400 font-normal">(необязательно)</span>
                </Label>
                <Textarea
                  id="contact-msg"
                  placeholder={`Хочу записаться на ${details.name}. Возраст ребёнка...`}
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  rows={2}
                  disabled={sending}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className={`flex-1 bg-gradient-to-r ${gradient} text-white font-bold h-11 hover:opacity-90`}
                  disabled={sending}
                >
                  {sending ? (
                    <span className="flex items-center gap-2">
                      <Icon name="Loader2" size={16} className="animate-spin" />
                      Отправляем...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Icon name="Send" size={16} />
                      Записаться
                    </span>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
                  Закрыть
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Или звоните напрямую:{' '}
                <a href="tel:+79204163606" className="text-orange-600 font-semibold hover:underline">
                  +7 920 416-36-06
                </a>
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
