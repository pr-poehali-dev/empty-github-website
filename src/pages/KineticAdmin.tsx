import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import PublicProfileModal from '@/components/kinetic/PublicProfileModal';
import { useToast } from '@/hooks/use-toast';
import {
  Character,
  Trick,
  KineticsTransaction,
  TrainingVisit,
  SPORT_NAMES,
  SPORT_ICONS,
  SportType,
  DIFFICULTY_NAMES,
  DIFFICULTY_COLORS,
} from '@/types/kinetic';
import * as api from '@/services/kineticApi';
import { useNavigate } from 'react-router-dom';

const KineticAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [kineticsAmount, setKineticsAmount] = useState(0);
  const [kineticsReason, setKineticsReason] = useState('');
  const [isDeduct, setIsDeduct] = useState(false);
  const [transactions, setTransactions] = useState<KineticsTransaction[]>([]);
  const [trainingVisits, setTrainingVisits] = useState<TrainingVisit[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [trainerInput, setTrainerInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [trainingDate, setTrainingDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainingNotes, setTrainingNotes] = useState('');
  const [profileCharId, setProfileCharId] = useState<number | null>(null);
  const [charSearch, setCharSearch] = useState('');
  const [trickSearch, setTrickSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCharacter) {
      loadCharacterDetails(selectedCharacter.id);
    }
  }, [selectedCharacter?.id]);

  const loadData = async () => {
    try {
      const [chars, trks] = await Promise.all([api.getAllCharacters(), api.getTricks()]);
      setCharacters(chars || []);
      setTricks(trks || []);
    } catch (err) {
      toast({ title: 'Ошибка загрузки', description: String(err), variant: 'destructive' });
    }
  };

  const loadCharacterDetails = async (charId: number) => {
    setLoadingTx(true);
    try {
      const [txs, visits] = await Promise.all([
        api.getKineticsTransactions(charId),
        api.getTrainingVisits(charId),
      ]);
      setTransactions(txs || []);
      setTrainingVisits(visits || []);
    } catch {
      setTransactions([]);
      setTrainingVisits([]);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleKineticsAction = async () => {
    if (!selectedCharacter || kineticsAmount <= 0 || !kineticsReason.trim()) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    try {
      if (isDeduct) {
        await api.deductKinetics(selectedCharacter.id, kineticsAmount, kineticsReason);
      } else {
        await api.addKinetics(selectedCharacter.id, kineticsAmount, kineticsReason);
      }
      toast({
        title: isDeduct ? '➖ Кинетики списаны' : '➕ Кинетики начислены',
        description: `${kineticsAmount} кинетиков · ${selectedCharacter.name}`,
      });
      setKineticsAmount(0);
      setKineticsReason('');
      await loadData();
      await loadCharacterDetails(selectedCharacter.id);
      // Refresh selected character
      const updatedChars = await api.getAllCharacters();
      setCharacters(updatedChars);
      const refreshed = updatedChars.find((c: Character) => c.id === selectedCharacter.id);
      if (refreshed) setSelectedCharacter(refreshed);
    } catch (err) {
      toast({ title: 'Ошибка', description: String(err), variant: 'destructive' });
    }
  };

  const handleUpdateCharacterMeta = async () => {
    if (!selectedCharacter) return;
    try {
      const body: Record<string, unknown> = {};
      if (trainerInput.trim()) body.trainer_name = trainerInput.trim();
      if (ageInput) body.age = Number(ageInput);
      if (!Object.keys(body).length) return;
      await api.updateCharacter(selectedCharacter.id, body);
      toast({ title: '✅ Персонаж обновлён' });
      await loadData();
    } catch (err) {
      toast({ title: 'Ошибка', description: String(err), variant: 'destructive' });
    }
  };

  const handleRecordTraining = async () => {
    if (!selectedCharacter || !trainerInput.trim()) {
      toast({ title: 'Ошибка', description: 'Укажите имя тренера', variant: 'destructive' });
      return;
    }
    try {
      await api.recordTrainingVisit(selectedCharacter.id, trainerInput, trainingNotes || undefined);
      toast({ title: '✅ Тренировка записана', description: `${selectedCharacter.name} · ${trainingDate}` });
      setTrainingNotes('');
      await loadCharacterDetails(selectedCharacter.id);
    } catch (err) {
      toast({ title: 'Ошибка', description: String(err), variant: 'destructive' });
    }
  };

  const handleConfirmTrick = async (trickId: number) => {
    if (!selectedCharacter || !trainerInput.trim()) {
      toast({ title: 'Укажите тренера', variant: 'destructive' });
      return;
    }
    try {
      await api.confirmTrick(selectedCharacter.id, trickId, trainerInput);
      toast({ title: '✅ Трюк подтверждён' });
    } catch (err) {
      toast({ title: 'Ошибка', description: String(err), variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">Необходимо войти в систему</p>
          <Button onClick={() => navigate('/')} className="bg-white text-purple-900 hover:bg-white/90">
            На главную
          </Button>
        </div>
      </div>
    );
  }

  const filteredChars = characters.filter(c =>
    c.name.toLowerCase().includes(charSearch.toLowerCase()) ||
    c.sport_type.toLowerCase().includes(charSearch.toLowerCase())
  );

  const filteredTricks = tricks.filter(t =>
    t.name.toLowerCase().includes(trickSearch.toLowerCase()) ||
    t.difficulty.toLowerCase().includes(trickSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation currentPage="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="Zap" size={24} className="text-yellow-300" />
            Kinetic Admin
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Управление кинетической вселенной — персонажи, трюки, кинетики, тренировки
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Персонажей', value: characters.length, icon: 'Users', color: 'text-blue-300' },
            { label: 'Трюков в базе', value: tricks.length, icon: 'Star', color: 'text-yellow-300' },
            { label: 'Видов спорта', value: Object.keys(SPORT_NAMES).length, icon: 'Layers', color: 'text-green-300' },
            { label: 'Транзакций', value: transactions.length, icon: 'ArrowLeftRight', color: 'text-purple-300' },
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character list */}
          <Card className="bg-white/95 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="Users" size={18} />
                Персонажи ({filteredChars.length})
              </CardTitle>
              <Input
                placeholder="Поиск..."
                value={charSearch}
                onChange={e => setCharSearch(e.target.value)}
                className="mt-1"
              />
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[480px] overflow-y-auto divide-y">
                {filteredChars.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 text-sm">Персонажей нет</p>
                ) : (
                  filteredChars.map(char => (
                    <button
                      key={char.id}
                      className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center gap-3 ${
                        selectedCharacter?.id === char.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedCharacter(char);
                        setTrainerInput(char.trainer_name || '');
                        setAgeInput(char.age ? String(char.age) : '');
                      }}
                    >
                      <span className="text-xl shrink-0">{SPORT_ICONS[char.sport_type]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate text-sm">{char.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500">
                            {SPORT_NAMES[char.sport_type as SportType] || char.sport_type}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">Ур.{char.level}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-yellow-600">💰{char.kinetics}</p>
                        {char.is_pro && (
                          <Badge className="text-[9px] px-1 py-0 bg-yellow-100 text-yellow-800">PRO</Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Character detail */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedCharacter ? (
              <Card className="bg-white/95">
                <CardContent className="py-16 text-center text-gray-400">
                  <Icon name="MousePointerClick" size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Выберите персонажа из списка слева</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Character header */}
                <Card className="bg-white/95">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{SPORT_ICONS[selectedCharacter.sport_type]}</span>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedCharacter.name}</h2>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge>{SPORT_NAMES[selectedCharacter.sport_type as SportType]}</Badge>
                            <Badge variant="outline">Уровень {selectedCharacter.level}</Badge>
                            <span className="text-yellow-600 font-semibold text-sm">
                              💰 {selectedCharacter.kinetics}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setProfileCharId(selectedCharacter.id)}
                        >
                          <Icon name="Eye" size={14} />
                          Профиль
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                      {[
                        { label: 'Баланс', value: selectedCharacter.balance, icon: '⚖️' },
                        { label: 'Скорость', value: selectedCharacter.speed, icon: '⚡' },
                        { label: 'Смелость', value: selectedCharacter.courage, icon: '🔥' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-gray-50 rounded-lg p-2">
                          <span className="text-lg">{stat.icon}</span>
                          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action tabs */}
                <Tabs defaultValue="kinetics" className="space-y-3">
                  <TabsList className="bg-white/80">
                    <TabsTrigger value="kinetics">💰 Кинетики</TabsTrigger>
                    <TabsTrigger value="training">🏋️ Тренировка</TabsTrigger>
                    <TabsTrigger value="tricks">⭐ Трюки</TabsTrigger>
                    <TabsTrigger value="history">📊 История</TabsTrigger>
                  </TabsList>

                  {/* Kinetics */}
                  <TabsContent value="kinetics">
                    <Card className="bg-white/95">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Управление кинетиками</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          {[false, true].map(deduct => (
                            <button
                              key={String(deduct)}
                              onClick={() => setIsDeduct(deduct)}
                              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                isDeduct === deduct
                                  ? deduct
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-green-600 text-white border-green-600'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {deduct ? '➖ Списать' : '➕ Начислить'}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Количество</Label>
                            <Input
                              type="number"
                              min={1}
                              value={kineticsAmount || ''}
                              onChange={e => setKineticsAmount(Number(e.target.value))}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Причина</Label>
                            <Input
                              value={kineticsReason}
                              onChange={e => setKineticsReason(e.target.value)}
                              placeholder="Описание операции"
                            />
                          </div>
                        </div>
                        <Button
                          className={`w-full gap-2 ${isDeduct ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                          onClick={handleKineticsAction}
                        >
                          <Icon name={isDeduct ? 'Minus' : 'Plus'} size={16} />
                          {isDeduct ? 'Списать кинетики' : 'Начислить кинетики'}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Training */}
                  <TabsContent value="training">
                    <Card className="bg-white/95">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Записать тренировку</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Тренер</Label>
                            <Input
                              value={trainerInput}
                              onChange={e => setTrainerInput(e.target.value)}
                              placeholder="Имя тренера"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Возраст ученика</Label>
                            <Input
                              type="number"
                              value={ageInput}
                              onChange={e => setAgeInput(e.target.value)}
                              placeholder="14"
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label>Дата</Label>
                            <Input
                              type="date"
                              value={trainingDate}
                              onChange={e => setTrainingDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Заметки о тренировке</Label>
                          <textarea
                            className="w-full min-h-[70px] px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Описание тренировки..."
                            value={trainingNotes}
                            onChange={e => setTrainingNotes(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                            onClick={handleRecordTraining}
                          >
                            <Icon name="Plus" size={16} />
                            Записать тренировку
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2"
                            onClick={handleUpdateCharacterMeta}
                          >
                            <Icon name="Save" size={16} />
                            Сохранить данные
                          </Button>
                        </div>
                        {trainingVisits.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Последние тренировки ({trainingVisits.length})
                            </p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {[...trainingVisits].reverse().slice(0, 10).map(v => (
                                <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {v.trainer_name || '—'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(v.visited_at).toLocaleDateString('ru-RU')}
                                    </p>
                                  </div>
                                  <div className="text-right text-xs">
                                    <p className="text-purple-600 font-semibold">+{v.xp_gained} XP</p>
                                    <p className="text-yellow-600">+{v.kinetics_gained} к</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tricks */}
                  <TabsContent value="tricks">
                    <Card className="bg-white/95">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon name="Star" size={16} />
                          Подтверждение трюков
                        </CardTitle>
                        <div className="text-xs text-gray-500 mt-1">
                          Укажите имя тренера во вкладке «Тренировка», затем подтверждайте трюки
                        </div>
                        <Input
                          placeholder="Поиск трюка..."
                          value={trickSearch}
                          onChange={e => setTrickSearch(e.target.value)}
                          className="mt-2"
                        />
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-80 overflow-y-auto divide-y">
                          {filteredTricks.map(trick => (
                            <div
                              key={trick.id}
                              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{trick.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge
                                    className={`text-[10px] px-1 py-0 ${DIFFICULTY_COLORS[trick.difficulty]}`}
                                  >
                                    {DIFFICULTY_NAMES[trick.difficulty]}
                                  </Badge>
                                  <span className="text-[10px] text-yellow-600">+{trick.experience_reward} XP</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-2 ml-2 shrink-0 gap-1"
                                onClick={() => handleConfirmTrick(trick.id)}
                              >
                                <Icon name="CheckCircle" size={12} />
                                ОК
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* History */}
                  <TabsContent value="history">
                    <Card className="bg-white/95">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon name="ArrowLeftRight" size={16} />
                          История кинетиков
                          {loadingTx && (
                            <Icon name="Loader2" size={14} className="animate-spin text-gray-400" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {transactions.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            <Icon name="Receipt" size={32} className="mx-auto mb-2 opacity-40" />
                            <p>Транзакций нет</p>
                          </div>
                        ) : (
                          <div className="max-h-64 overflow-y-auto divide-y">
                            {[...transactions].reverse().map(tx => (
                              <div key={tx.id} className="flex items-center justify-between px-4 py-2.5">
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-700 truncate">
                                    {tx.description || tx.source}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(tx.created_at).toLocaleString('ru-RU', {
                                      day: '2-digit', month: '2-digit',
                                      hour: '2-digit', minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                                <span
                                  className={`font-bold text-sm shrink-0 ml-3 ${
                                    tx.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {tx.transaction_type === 'earn' ? '+' : '-'}{tx.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>

        {/* All tricks table */}
        <Card className="bg-white/95">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-2 text-base">
                <Icon name="List" size={18} />
                Все трюки базы данных ({tricks.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Название</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 hidden sm:table-cell">Спорт</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Уровень</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 hidden md:table-cell">XP</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600 hidden md:table-cell">💰</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tricks.slice(0, 30).map(trick => (
                    <tr key={trick.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{trick.name}</td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <span className="text-base">{SPORT_ICONS[trick.sport_type]}</span>
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={`text-[10px] px-1.5 py-0 ${DIFFICULTY_COLORS[trick.difficulty]}`}>
                          {DIFFICULTY_NAMES[trick.difficulty]}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-purple-600 font-semibold hidden md:table-cell">
                        +{trick.experience_reward}
                      </td>
                      <td className="px-4 py-2 text-yellow-600 font-semibold hidden md:table-cell">
                        +{trick.kinetics_reward}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tricks.length > 30 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  Показано 30 из {tricks.length} трюков
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {profileCharId !== null && (
        <PublicProfileModal
          characterId={profileCharId}
          onClose={() => setProfileCharId(null)}
        />
      )}
    </div>
  );
};

export default KineticAdmin;
