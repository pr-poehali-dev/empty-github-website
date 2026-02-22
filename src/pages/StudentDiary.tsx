import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface DiaryEntry {
  id: string;
  student_name: string;
  sport_type: string;
  date: string;
  notes: string;
  trainer_name?: string;
  created_at: string;
}

export default function StudentDiary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('trainer_diary_entries');
    if (stored && user) {
      const all = JSON.parse(stored) as DiaryEntry[];
      setEntries(all.filter(e => e.student_name === user.name));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation currentPage="dashboard" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Мой дневник</h1>
        {entries.length === 0 ? (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-6 text-center text-white/70 py-16">
              <Icon name="BookOpen" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Записей в дневнике пока нет</p>
              <p className="text-sm mt-2">Тренер добавит записи после занятий</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id} className="bg-white/95">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{entry.sport_type}</CardTitle>
                    <Badge variant="outline">{new Date(entry.date).toLocaleDateString('ru-RU')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{entry.notes}</p>
                  {entry.trainer_name && (
                    <p className="text-sm text-gray-500 mt-2">👨‍🏫 Тренер: {entry.trainer_name}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Button 
          variant="outline" 
          className="mt-6 text-white border-white/30 hover:bg-white/10"
          onClick={() => navigate('/client')}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>
      </div>
    </div>
  );
}
