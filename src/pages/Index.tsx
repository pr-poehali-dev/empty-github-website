import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import Countdown from '@/components/Countdown';
import GlobalChatBot from '@/components/GlobalChatBot';
import Auth from '@/components/Auth';
import Navigation from '@/components/Navigation';
import SportDetailModal from '@/components/SportDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ── Types ────────────────────────────────────────────────────
interface Sport {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  age: string;
  tag?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

// ── Data ─────────────────────────────────────────────────────
const sports: Sport[] = [
  {
    id: 'skate',
    name: 'Скейтбординг',
    icon: '🛹',
    description: 'Изучаем основы катания, повороты, торможение и первые трюки',
    color: 'from-red-500 to-orange-500',
    age: 'с 5 лет',
    tag: 'Хит',
  },
  {
    id: 'roller',
    name: 'Ролики',
    icon: '🛼',
    description: 'От первых шагов до слалома и фристайла',
    color: 'from-blue-500 to-cyan-500',
    age: 'с 4 лет',
  },
  {
    id: 'bike',
    name: 'Велосипед',
    icon: '🚲',
    description: 'Безопасная езда, трюки и велопрогулки',
    color: 'from-green-500 to-emerald-500',
    age: 'с 4 лет',
  },
  {
    id: 'bmx',
    name: 'BMX',
    icon: '🚴‍♂️',
    description: 'Экстремальная езда, джампы и трюки на рампе',
    color: 'from-orange-500 to-amber-500',
    age: 'с 6 лет',
    tag: 'Экстрим',
  },
  {
    id: 'scooter',
    name: 'Трюковой самокат',
    icon: '🛴',
    description: 'Современный городской экстрим и воздушные трюки',
    color: 'from-purple-500 to-pink-500',
    age: 'с 5 лет',
    tag: 'Популярно',
  },
  {
    id: 'runbike',
    name: 'Беговел',
    icon: '🏃‍♂️',
    description: 'Первые шаги к освоению равновесия для самых маленьких',
    color: 'from-teal-500 to-cyan-500',
    age: 'с 3 лет',
    tag: 'Малыши',
  },
];

const faqData: FaqItem[] = [
  {
    question: 'С какого возраста можно заниматься?',
    answer:
      'С 3 лет принимаем на беговел. С 4–5 лет — на ролики, велосипед, скейт и самокат. С 6 лет — на BMX. Взрослых обучаем без ограничений по возрасту!',
  },
  {
    question: 'Нужен ли свой инвентарь?',
    answer:
      'Нет! Весь инвентарь (доска, ролики, самокат, велосипед, BMX) включён в стоимость занятий. Просто приходите в удобной одежде и кроссовках.',
  },
  {
    question: 'Есть ли защитная экипировка?',
    answer:
      'Да! Полный комплект защиты (шлем, наколенники, налокотники, защита запястий) входит в стоимость и обязателен для всех учеников.',
  },
  {
    question: 'Как проходит первое занятие?',
    answer:
      'Первое пробное занятие абсолютно бесплатно! Тренер познакомится с вашим ребёнком, оценит уровень и покажет, как всё устроено. Никаких обязательств.',
  },
  {
    question: 'Можно ли взрослым заниматься?',
    answer:
      'Конечно! Мы обучаем взрослых любого возраста и уровня подготовки. Есть специальные группы для взрослых начинающих. Никогда не поздно начать!',
  },
  {
    question: 'Сколько стоят занятия?',
    answer:
      'Абонемент от 2 500 руб./месяц. Разовое занятие от 800 руб. В стоимость входит инвентарь и защита. Первое занятие — бесплатно!',
  },
];

const features = [
  { icon: '🛡️', title: 'Безопасность', desc: 'Полная защитная экипировка для каждого ученика' },
  { icon: '👨‍🏫', title: 'Опытные тренеры', desc: 'Сертифицированные инструкторы с соревновательным опытом' },
  { icon: '🏟️', title: 'Крытый скейт-парк', desc: 'Тренировки в любую погоду круглый год' },
  { icon: '🎯', title: 'Пробное бесплатно', desc: 'Первое занятие без оплаты и обязательств' },
];

// ── Component ─────────────────────────────────────────────────
export default function Index() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuth(true);
    }
  };

  const handleKineticClick = () => {
    if (user) {
      navigate('/kinetic-universe');
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
      {/* ── Navigation ─────────────────────────────────────── */}
      <Navigation currentPage="home" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero section ──────────────────────────────────── */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/30">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Запись открыта · Пробное занятие бесплатно
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-lg">
            KINETIC{' '}
            <span className="bg-white text-orange-500 px-3 py-1 rounded-xl inline-block">
              KIDS
            </span>
          </h1>

          <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto mb-3 leading-relaxed">
            Спортивная школа экстремального катания для детей и взрослых.
            Скейт, ролики, BMX, самокат, велосипед и беговел.
          </p>

          <div className="flex items-center justify-center gap-2 mb-8 text-white/80 text-sm">
            <Icon name="MapPin" size={16} />
            <span>Нижний Новгород</span>
            <span>·</span>
            <Icon name="Clock" size={16} />
            <span>Пн–Вс 10:00–20:00</span>
            <span>·</span>
            <Icon name="Phone" size={16} />
            <a href="tel:+79204163606" className="hover:text-white font-medium">
              +7 920 416-36-06
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-white text-orange-600 hover:bg-white/90 font-black text-lg px-8 h-14 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              onClick={() => setSelectedSport(sports[0])}
            >
              🎯 Записаться бесплатно
            </Button>
            <Button
              variant="outline"
              className="border-white/50 text-white hover:bg-white/20 font-bold text-base px-6 h-14 backdrop-blur"
              onClick={handleKineticClick}
            >
              ⚡ Кинетическая вселенная
            </Button>
            {!user ? (
              <Button
                variant="outline"
                className="border-white/50 text-white hover:bg-white/20 font-bold text-base px-6 h-14 backdrop-blur"
                onClick={() => setShowAuth(true)}
              >
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            ) : (
              <Button
                variant="outline"
                className="border-white/50 text-white hover:bg-white/20 font-bold text-base px-6 h-14 backdrop-blur"
                onClick={handleDashboardClick}
              >
                <Icon name="LayoutDashboard" size={18} className="mr-2" />
                Кабинет
              </Button>
            )}
          </div>
        </section>

        {/* ── Countdown ─────────────────────────────────────── */}
        <Countdown />

        {/* ── Features strip ────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {features.map(f => (
            <div
              key={f.title}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white text-center border border-white/30 hover:bg-white/30 transition-colors"
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-bold text-sm">{f.title}</div>
              <div className="text-white/75 text-xs mt-1 leading-tight">{f.desc}</div>
            </div>
          ))}
        </section>

        {/* ── Sports grid ───────────────────────────────────── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              🛹 Наши направления
            </h2>
            <p className="text-white/80 text-base">
              6 видов спорта · Группы для всех возрастов и уровней
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sports.map(sport => (
              <Card
                key={sport.id}
                className="group cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white"
                onClick={() => setSelectedSport(sport)}
              >
                {/* Color bar */}
                <div className={`h-2 bg-gradient-to-r ${sport.color}`} />

                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${sport.color} rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-200`}>
                        {sport.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black text-gray-900">
                          {sport.name}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Icon name="Users" size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{sport.age}</span>
                        </div>
                      </div>
                    </div>
                    {sport.tag && (
                      <Badge className={`bg-gradient-to-r ${sport.color} text-white border-0 text-xs shrink-0`}>
                        {sport.tag}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <CardDescription className="text-gray-600 text-sm leading-relaxed mb-4">
                    {sport.description}
                  </CardDescription>
                  <Button
                    className={`w-full bg-gradient-to-r ${sport.color} text-white font-bold border-0 hover:opacity-90 transition-opacity h-9 text-sm`}
                    onClick={e => { e.stopPropagation(); setSelectedSport(sport); }}
                  >
                    Подробнее и запись →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Pricing strip ─────────────────────────────────── */}
        <section className="mb-12">
          <div className="bg-white/15 backdrop-blur-sm rounded-3xl border border-white/30 p-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-6">
              💰 Цены и абонементы
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Разовое', price: 'от 800 ₽', desc: 'Одно занятие в удобное время', icon: '🎫', highlight: false },
                { title: 'Абонемент', price: 'от 2 500 ₽', desc: '4 занятия в месяц · всё включено', icon: '📋', highlight: true },
                { title: 'Интенсив', price: 'от 6 000 ₽', desc: '12 занятий · максимальный прогресс', icon: '🚀', highlight: false },
              ].map(plan => (
                <div
                  key={plan.title}
                  className={`rounded-2xl p-5 text-center transition-all ${
                    plan.highlight
                      ? 'bg-white text-gray-900 shadow-2xl scale-105'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {plan.highlight && (
                    <div className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-wide">
                      ⭐ Популярный выбор
                    </div>
                  )}
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <div className="font-black text-lg">{plan.title}</div>
                  <div className={`text-2xl font-black my-2 ${plan.highlight ? 'text-orange-500' : 'text-yellow-300'}`}>
                    {plan.price}
                  </div>
                  <div className={`text-sm mb-4 ${plan.highlight ? 'text-gray-500' : 'text-white/75'}`}>
                    {plan.desc}
                  </div>
                  <Button
                    className={`w-full font-bold ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90'
                        : 'bg-white text-orange-600 hover:bg-white/90'
                    }`}
                    onClick={() => setSelectedSport(sports[0])}
                  >
                    Записаться
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-center text-white/70 text-sm mt-4">
              🎯 Первое пробное занятие — <strong className="text-white">бесплатно</strong> для каждого нового ученика
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              ❓ Частые вопросы
            </h2>
            <p className="text-white/80">Всё, что нужно знать перед первым занятием</p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqData.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/95 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 font-bold text-gray-900 hover:text-orange-600 transition-colors"
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                >
                  <span>{item.question}</span>
                  <Icon
                    name={openFAQ === idx ? 'ChevronUp' : 'ChevronDown'}
                    size={20}
                    className={`shrink-0 transition-transform text-orange-500 ${openFAQ === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFAQ === idx && (
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA / Contact section ─────────────────────────── */}
        <section className="mb-12">
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
            <div className="text-5xl mb-4">📞</div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              Остались вопросы?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Позвоните нам или напишите в WhatsApp/Telegram — отвечаем быстро!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a href="tel:+79204163606">
                <Button className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-black text-lg px-8 h-14 shadow-xl hover:opacity-90">
                  <Icon name="Phone" size={20} className="mr-2" />
                  +7 920 416-36-06
                </Button>
              </a>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold h-14 px-6"
                onClick={() => setSelectedSport(sports[0])}
              >
                📝 Оставить заявку
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Icon name="Clock" size={14} />
                Пн–Вс 10:00–20:00
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="MapPin" size={14} />
                Нижний Новгород
              </span>
            </div>
          </div>
        </section>

        {/* ── Kinetic Universe promo ────────────────────────── */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white text-center shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              {['🛹', '🛼', '🚴', '🛴', '🚲'].map((icon, i) => (
                <div
                  key={i}
                  className="absolute text-6xl"
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${(i * 20) + 5}%`,
                    transform: 'rotate(-15deg)',
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
            <div className="relative z-10">
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 border mb-4">
                🎮 Геймификация
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-black mb-3">
                ⚡ Кинетическая вселенная
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-6 text-base">
                Создай своего персонажа, осваивай трюки, участвуй в турнирах
                и зарабатывай кинетики. Игровая платформа для учеников школы!
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {['🏆 Турниры', '⭐ Трюки', '💰 Кинетики', '🎮 Мини-игры', '👥 Персонажи'].map(tag => (
                  <Badge key={tag} className="bg-white/10 text-white/80 border-white/20 border px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-black text-lg px-8 h-12 hover:opacity-90 shadow-xl"
                onClick={handleKineticClick}
              >
                {user ? '→ Перейти в вселенную' : '→ Войти и играть'}
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="text-center text-white/60 text-sm pb-6 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-white text-lg">KINETIC KIDS</span>
          </div>
          <p>© {new Date().getFullYear()} Kinetic Kids. Спортивная школа экстремального катания.</p>
          <p>
            <a href="tel:+79204163606" className="text-white/80 hover:text-white underline">
              +7 920 416-36-06
            </a>
            {' · '}
            Нижний Новгород{' · '}
            Пн–Вс 10:00–20:00
          </p>
        </footer>
      </div>

      {/* ── Auth modal ────────────────────────────────────────── */}
      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* ── Sport detail modal ────────────────────────────────── */}
      <SportDetailModal
        sport={selectedSport}
        isOpen={!!selectedSport}
        onClose={() => setSelectedSport(null)}
      />

      {/* ── Global chatbot ────────────────────────────────────── */}
      <GlobalChatBot />
    </div>
  );
}
