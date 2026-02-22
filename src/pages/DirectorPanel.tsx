import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface DiaryEntry {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  notes: string;
  sport: string;
  trainerName: string;
  createdAt: string;
}

interface LessonPlan {
  id: string;
  groupId: number;
  groupName: string;
  date: string;
  topic: string;
  goals: string;
  duration: number;
  createdAt: string;
}

interface Trainer {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

const SPORT_LABELS: Record<string, string> = {
  skate: '🛹 Скейтборд',
  rollers: '🛼 Ролики',
  bmx: '🚴 BMX',
  scooter: '🛴 Самокат',
  skateboard: '🛹 Скейтборд',
  rollerblade: '🛼 Ролики',
};

export default function DirectorPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      const stored = localStorage.getItem('fitness_app_data');
      if (stored) {
        const data = JSON.parse(stored);
        const allUsers = data.users || [];
        const realTrainers = allUsers.filter((u: { role: string }) => u.role === 'trainer');
        const realClients = allUsers.filter((u: { role: string }) => u.role === 'client');
        setTrainers(realTrainers.map((t: { id: string; name: string; email: string }) => ({
          id: t.id, name: t.name, email: t.email,
        })));
        setStudents(realClients.map((c: { id: string; name: string; email: string }) => ({
          id: c.id, name: c.name, email: c.email,
        })));
      }

      const storedEntries = localStorage.getItem('trainer_diary_entries');
      if (storedEntries) setEntries(JSON.parse(storedEntries));

      const storedPlans = localStorage.getItem('trainer_lesson_plans');
      if (storedPlans) setPlans(JSON.parse(storedPlans));
    } catch (err) {
      console.error('DirectorPanel loadAllData error:', err);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('trainer_diary_entries', JSON.stringify(updated));
    toast({ title: '🗑️ Запись удалена' });
  };

  const handleDeletePlan = (id: string) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    localStorage.setItem('trainer_lesson_plans', JSON.stringify(updated));
    toast({ title: '🗑️ План удалён' });
  };

  const filteredEntries = entries.filter(e => {
    const matchTrainer = selectedTrainer === 'all' || e.trainerName === selectedTrainer;
    const matchStudent = selectedStudent === 'all' || e.studentId === selectedStudent;
    const matchSearch = !searchQuery ||
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.trainerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTrainer && matchStudent && matchSearch;
  });

  const filteredPlans = plans.filter(p => {
    const matchTrainer = selectedTrainer === 'all';
    const matchSearch = !searchQuery ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTrainer && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">⚡</span>
            <span className="font-black text-white text-lg">
              KINETIC <span className="text-yellow-300">KIDS</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 border">Директор</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 gap-1.5"
              onClick={() => navigate('/director-dashboard')}
            >
              <Icon name="LayoutDashboard" size={16} />
              <span className="hidden sm:inline">Дашборд</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 gap-1.5"
              onClick={() => navigate('/')}
            >
              <Icon name="LogOut" size={16} />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="FolderOpen" size={24} className="text-purple-300" />
            Панель дневников
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Просмотр и управление дневниками тренировок и планами уроков
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Тренеров', value: trainers.length, icon: 'UserCheck', color: 'text-green-300' },
            { label: 'Учеников', value: students.length, icon: 'Users', color: 'text-blue-300' },
            { label: 'Записей дневника', value: entries.length, icon: 'BookOpen', color: 'text-yellow-300' },
            { label: 'Планов уроков', value: plans.length, icon: 'Calendar', color: 'text-purple-300' },
          ].map(s => (
            <Card key={s.label} className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={s.icon} size={15} className={s.color} />
                  <span className="text-xs text-white/60">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-white/95">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[180px] space-y-1">
                <label className="text-xs font-medium text-gray-600">Поиск</label>
                <Input
                  placeholder="Имя, тема, заметки..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-44 space-y-1">
                <label className="text-xs font-medium text-gray-600">Тренер</label>
                <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все тренеры</SelectItem>
                    {trainers.map(t => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-44 space-y-1">
                <label className="text-xs font-medium text-gray-600">Ученик</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все ученики</SelectItem>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(searchQuery || selectedTrainer !== 'all' || selectedStudent !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setSelectedTrainer('all'); setSelectedStudent('all'); }}
                  className="gap-1"
                >
                  <Icon name="X" size={14} />
                  Сбросить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="entries" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="entries" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              📖 Дневники ({filteredEntries.length})
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              📅 Планы ({filteredPlans.length})
            </TabsTrigger>
            <TabsTrigger value="trainers" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              👨‍🏫 Тренеры
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              🎓 Ученики
            </TabsTrigger>
          </TabsList>

          {/* Diary entries */}
          <TabsContent value="entries">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="BookOpen" size={18} />
                  Записи дневников тренировок
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="BookOpen" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>{entries.length === 0 ? 'Записей ещё нет' : 'По выбранным фильтрам записей нет'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...filteredEntries].reverse().map(entry => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">{entry.studentName}</p>
                              <Badge variant="outline" className="text-xs">
                                {SPORT_LABELS[entry.sport] || entry.sport}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                              <span>📅 {new Date(entry.date).toLocaleDateString('ru-RU')}</span>
                              <span>👨‍🏫 {entry.trainerName}</span>
                              <span className="text-gray-300">
                                Добавлено: {new Date(entry.createdAt).toLocaleString('ru-RU', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Icon name="Trash2" size={15} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lesson plans */}
          <TabsContent value="plans">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="Calendar" size={18} />
                  Планы уроков
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPlans.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="Calendar" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>{plans.length === 0 ? 'Планов ещё нет' : 'По выбранным фильтрам планов нет'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...filteredPlans].reverse().map(plan => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">{plan.topic}</p>
                              <Badge variant="outline" className="text-xs">{plan.groupName}</Badge>
                            </div>
                            {plan.goals && (
                              <p className="text-sm text-gray-500 mt-1">{plan.goals}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                              <span>📅 {new Date(plan.date).toLocaleDateString('ru-RU')}</span>
                              <span>⏱️ {plan.duration} мин.</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Icon name="Trash2" size={15} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainers */}
          <TabsContent value="trainers">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="UserCheck" size={18} />
                  Тренеры ({trainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainers.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="UserX" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Тренеров нет — назначьте роль тренера пользователям</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => navigate('/director-dashboard')}
                    >
                      Управление пользователями
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trainers.map(t => {
                      const trainerEntries = entries.filter(e => e.trainerName === t.name);
                      const trainerPlans = plans.filter(p => p.groupName.includes(t.name));
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between border rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-200 to-teal-200 flex items-center justify-center text-sm font-bold text-green-700 shrink-0">
                              {t.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{t.name}</p>
                              <p className="text-xs text-gray-500 truncate">{t.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {trainerEntries.length} записей
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {trainerPlans.length} планов
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students */}
          <TabsContent value="students">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="GraduationCap" size={18} />
                  Ученики ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="UserX" size={40} className="mx-auto mb-3 opacity-40" />
                    <p>Учеников нет</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map(s => {
                      const studentEntries = entries.filter(e => e.studentId === s.id);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between border rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{s.name}</p>
                              <p className="text-xs text-gray-500 truncate">{s.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {studentEntries.length} записей
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
