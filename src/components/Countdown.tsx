import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: December 1, 2025 (already past — will show zeros)
    const targetDate = new Date('2025-12-01T00:00:00').getTime();

    const tick = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const blocks = [
    { value: timeLeft.days, label: 'дней', gradient: 'from-red-500 to-orange-500' },
    { value: timeLeft.hours, label: 'часов', gradient: 'from-blue-500 to-teal-500' },
    { value: timeLeft.minutes, label: 'минут', gradient: 'from-purple-500 to-pink-500' },
    { value: timeLeft.seconds, label: 'секунд', gradient: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-12 border border-white/50">
      <div className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🚀 До открытия осталось:
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {blocks.map(block => (
          <div key={block.label} className="text-center">
            <div className={`bg-gradient-to-r ${block.gradient} text-white rounded-2xl p-4 shadow-lg`}>
              <div className="text-4xl font-black tabular-nums">
                {String(block.value).padStart(2, '0')}
              </div>
              <div className="text-sm font-medium opacity-90 mt-1">{block.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className="text-gray-600 text-lg font-medium">
          🎉 Мы уже открыты! Приходите на пробное занятие
        </p>
        <p className="text-gray-500 text-sm">
          Первое занятие — бесплатно для каждого нового ученика
        </p>
      </div>
    </div>
  );
}
