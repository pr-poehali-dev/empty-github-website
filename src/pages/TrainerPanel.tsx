import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  sport_type: string;
}

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

const SPORT_LABELS: Record<string, string> = {
  skate: '🛹 Скейтборд',
  rollers: '🛼 Ролики',
  bmx: '🚴 BMX',
  scooter: '🛴 Самокат',
  bike: '🚲 Велосипед',
  skateboard: '🛹 Скейтборд',
  rollerblade: '🛼 Ролики',
};

export default function TrainerPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Diary entry form
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryNotes, setEntryNotes] = useState('');
  const [entrySport, setEntrySport] = useState('skate');
  const [trainerName, setTrainerName] = useState('');

  // Lesson plan form
  const [planDate, setPlanDate] = useState(new Date().toISOString().split('T')[0]);
  const [planTopic, setPlanTopic] = useState('');
  const [planGoals, setPlanGoals] = useState('');
  const [planDuration, setPlanDuration] = useState('60');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const stored = localStorage.getItem('fitness_app_data');
      if (stored) {
        const data = JSON.parse(stored);
        const clients = (data.users || []).filter((u: { role: string }) => u.role === 'client');
        setStudents(clients.map((c: { id: string; name: string; email: string }) => ({
          id: c.id,
          name: c.name,
          email: c.email,
        })));
      }

      const storedEntries = localStorage.getItem('trainer_diary_entries');
      if (storedEntries) setDiaryEntries(JSON.parse(storedEntries));

      const storedPlans = localStorage.getItem('trainer_lesson_plans');
      if (storedPlans) setLessonPlans(JSON.parse(storedPlans));

      setGroups([
        { id: 1, name: 'Скейтборд начинающие', sport_type: 'skateboard' },
        { id: 2, name: 'Ролики продвинутые', sport_type: 'rollerblade' },
        { id: 3, name: 'BMX группа', sport_type: 'bmx' },
        { id: 4, name: 'Самокат микс', sport_type: 'scooter' },
      ]);
    } catch (err) {
      console.error('TrainerPanel loadData error:', err);
    }
  };

  const handleAddDiaryEntry = () => {
    if (!selectedStudent || !entryNotes.trim() || !trainerName.trim()) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    const student = students.find(s => s.id === selectedStudent);
    const newEntry: DiaryEntry = {
      id: `entry-${Date.now()}`,
      studentId: selectedStudent,
      studentName: student?.name || '',
      date: entryDate,
      notes: entryNotes,
      sport: entrySport,
      trainerName,
      createdAt: new Date().toISOString(),
    };
    const updated = [...diaryEntries, newEntry];
    setDiaryEntries(updated);
    localStorage.setItem('trainer_diary_entries', JSON.stringify(updated));
    setEntryNotes('');
    toast({ title: '✅ Запись добавлена', description: `Дневник ${student?.name} обновлён` });
  };

  const handleAddLessonPlan = () => {
    if (!selectedGroup || !planTopic.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите группу и тему', variant: 'destructive' });
      return;
    }
    const group = groups.find(g => g.id.toString() === selectedGroup);
    const newPlan: LessonPlan = {
      id: `plan-${Date.now()}`,
      groupId: Number(selectedGroup),
      groupName: group?.name || '',
      date: planDate,
      topic: planTopic,
      goals: planGoals,
      duration: Number(planDuration),
      createdAt: new Date().toISOString(),
    };
    const updated = [...lessonPlans, newPlan];
    setLessonPlans(updated);
    localStorage.setItem('trainer_lesson_plans', JSON.stringify(updated));
    setPlanTopic('');
    setPlanGoals('');
    toast({ title: '✅ План урока добавлен' });
  };

  const handleDeleteEntry = (id: string) => {
    const updated = diaryEntries.filter(e => e.id !== id);
    setDiaryEntries(updated);
    localStorage.setItem('trainer_diary_entries', JSON.stringify(updated));
    toast({ title: '🗑️ Запись удалена' });
  };

  const handleDeletePlan = (id: string) => {
    const updated = lessonPlans.filter(p => p.id !== id);
    setLessonPlans(updated);
    localStorage.setItem('trainer_lesson_plans', JSON.stringify(updated));
    toast({ title: '🗑️ План удалён' });
  };

  const filteredEntries = selectedStudent
    ? diaryEntries.filter(e => e.studentId === selectedStudent)
    : diaryEntries;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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
            <Badge className="bg-green-500/20 text-green-200 border-green-400/30 border">Тренер</Badge>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="BookOpen" size={24} className="text-green-300" />
            Панель тренера
          </h1>
          <p className="text-white/60 text-sm mt-1">Управление дневниками и планами уроков</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Учеников', value: students.length, icon: 'Users', color: 'text-blue-300' },
            { label: 'Групп', value: groups.length, icon: 'Users2', color: 'text-green-300' },
            { label: 'Записей', value: diaryEntries.length, icon: 'BookOpen', color: 'text-yellow-300' },
            { label: 'Планов', value: lessonPlans.length, icon: 'Calendar', color: 'text-purple-300' },
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

        <Tabs defaultValue="diary" className="space-y-4">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="diary" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              📖 Дневники
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              📅 Планы уроков
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 text-white">
              👥 Ученики
            </TabsTrigger>
          </TabsList>

          {/* Diary */}
          <TabsContent value="diary" className="space-y-4">
            {/* Add entry form */}
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="PlusCircle" size={18} className="text-green-600" />
                  Добавить запись в дневник
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Ученик</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ученика" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Вид спорта</Label>
                    <Select value={entrySport} onValueChange={setEntrySport}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SPORT_LABELS).slice(0, 5).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Дата тренировки</Label>
                    <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Имя тренера</Label>
                    <Input
                      placeholder="Ваше имя"
                      value={trainerName}
                      onChange={e => setTrainerName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Заметки о тренировке</Label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Опишите прогресс ученика, выполненные трюки, замечания..."
                    value={entryNotes}
                    onChange={e => setEntryNotes(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 gap-2"
                  onClick={handleAddDiaryEntry}
                >
                  <Icon name="Plus" size={16} />
                  Добавить запись
                </Button>
              </CardContent>
            </Card>

            {/* Entries list */}
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon name="BookOpen" size={18} />
                    Записи дневника ({filteredEntries.length})
                  </CardTitle>
                  {selectedStudent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudent('')}
                      className="text-xs"
                    >
                      Показать все
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="BookOpen" size={36} className="mx-auto mb-2 opacity-40" />
                    <p>Записей нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...filteredEntries].reverse().map(entry => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">{entry.studentName}</p>
                              <Badge variant="outline" className="text-xs">
                                {SPORT_LABELS[entry.sport] || entry.sport}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span>📅 {new Date(entry.date).toLocaleDateString('ru-RU')}</span>
                              <span>👨‍🏫 {entry.trainerName}</span>
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
          <TabsContent value="plans" className="space-y-4">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="CalendarPlus" size={18} className="text-blue-600" />
                  Добавить план урока
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Группа</Label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите группу" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map(g => (
                          <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Дата урока</Label>
                    <Input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Тема урока</Label>
                    <Input
                      placeholder="Например: Базовые стойки"
                      value={planTopic}
                      onChange={e => setPlanTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Длительность (мин.)</Label>
                    <Input
                      type="number"
                      min={15}
                      max={240}
                      value={planDuration}
                      onChange={e => setPlanDuration(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Цели урока</Label>
                  <textarea
                    className="w-full min-h-[70px] px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Чему должны научиться ученики..."
                    value={planGoals}
                    onChange={e => setPlanGoals(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={handleAddLessonPlan}
                >
                  <Icon name="Plus" size={16} />
                  Добавить план
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="Calendar" size={18} />
                  Планы уроков ({lessonPlans.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lessonPlans.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="Calendar" size={36} className="mx-auto mb-2 opacity-40" />
                    <p>Планов нет</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...lessonPlans].reverse().map(plan => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">{plan.topic}</p>
                              <Badge variant="outline" className="text-xs">{plan.groupName}</Badge>
                            </div>
                            {plan.goals && (
                              <p className="text-sm text-gray-500 mt-1">{plan.goals}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
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

          {/* Students */}
          <TabsContent value="students">
            <Card className="bg-white/95">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon name="Users" size={18} />
                  Мои ученики ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Icon name="UserX" size={36} className="mx-auto mb-2 opacity-40" />
                    <p>Учеников нет — зарегистрируйте клиентов в системе</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map(s => {
                      const studentEntries = diaryEntries.filter(e => e.studentId === s.id);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center text-sm font-bold text-green-700 shrink-0">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{s.name}</p>
                              <p className="text-xs text-gray-500 truncate">{s.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {studentEntries.length} записей
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={() => setSelectedStudent(s.id)}
                            >
                              <Icon name="BookOpen" size={12} />
                              Дневник
                            </Button>
                          </div>
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
