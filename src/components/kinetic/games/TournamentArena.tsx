import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Trick, Character } from '@/types/kinetic';

interface TournamentArenaProps {
  tricks: Trick[];
  character: Character;
  onComplete: (earnedXP: number, earnedKinetics: number, won: boolean) => void;
  onClose: () => void;
}

const BOT_NAMES = ['Скейт-бот', 'Кинетик AI', 'Тренировочный бот', 'Спарринг-партнёр', 'Робо-райдер'];

const TournamentArena = ({ tricks, character, onComplete, onClose }: TournamentArenaProps) => {
  const [gameState, setGameState] = useState<'prepare' | 'battle' | 'result'>('prepare');
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [opponentTrick, setOpponentTrick] = useState<Trick | null>(null);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  const playerTricks = tricks.length > 0 ? tricks.slice(0, Math.min(5, tricks.length)) : [];
  const totalRounds = 3;

  const opponentName = useMemo(() => BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)], []);

  const handleTrickSelect = (trick: Trick) => {
    if (gameState !== 'prepare') return;

    setSelectedTrick(trick);
    const randomOpponentTrick = tricks[Math.floor(Math.random() * tricks.length)];
    setOpponentTrick(randomOpponentTrick);
    setGameState('battle');

    setTimeout(() => {
      const playerPoints = trick.experience_reward;
      const opponentPoints = randomOpponentTrick.experience_reward;

      let newPlayerScore = playerScore;
      let newOpponentScore = opponentScore;
      let result: 'win' | 'lose' | 'draw';

      if (playerPoints > opponentPoints) {
        newPlayerScore = playerScore + 1;
        setPlayerScore(newPlayerScore);
        result = 'win';
      } else if (opponentPoints > playerPoints) {
        newOpponentScore = opponentScore + 1;
        setOpponentScore(newOpponentScore);
        result = 'lose';
      } else {
        result = 'draw';
      }

      setRoundResult(result);

      if (round >= totalRounds) {
        setTimeout(() => setGameState('result'), 1200);
      }
    }, 1000);
  };

  const handleNextRound = () => {
    setRound(prev => prev + 1);
    setSelectedTrick(null);
    setOpponentTrick(null);
    setRoundResult(null);
    setGameState('prepare');
  };

  const handleFinish = () => {
    const won = playerScore > opponentScore;
    const earnedXP = won
      ? 80 + playerScore * 20
      : 20 + playerScore * 10;
    const earnedKinetics = won
      ? 15 + playerScore * 5
      : 5 + playerScore * 2;
    onComplete(earnedXP, earnedKinetics, won);
  };

  const ScoreBar = () => (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3 mb-4">
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-1">{character.name}</p>
        <p className="text-2xl font-bold text-green-400">{playerScore}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400">Раунд {round}/{totalRounds}</p>
        <p className="text-lg text-gray-300 font-semibold">VS</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-1">{opponentName}</p>
        <p className="text-2xl font-bold text-red-400">{opponentScore}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-yellow-500/50 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-yellow-300 flex items-center gap-2">
            <Icon name="Trophy" size={20} />
            Турнирная арена
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <ScoreBar />

          {/* Prepare state — pick a trick */}
          {gameState === 'prepare' && (
            <div>
              <p className="text-sm text-gray-400 mb-3 text-center">Выбери трюк для этого раунда:</p>
              {playerTricks.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Нет доступных трюков</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {playerTricks.map(trick => (
                    <button
                      key={trick.id}
                      className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-yellow-500 rounded-lg p-3 transition-all"
                      onClick={() => handleTrickSelect(trick)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">{trick.name}</span>
                        <span className="text-yellow-400 text-sm font-bold">{trick.experience_reward} XP</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 capitalize">{trick.difficulty}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Battle state */}
          {gameState === 'battle' && selectedTrick && opponentTrick && (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-400">Битва трюков!</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Player trick */}
                <div className="bg-green-900/40 border border-green-600 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-400 mb-1">{character.name}</p>
                  <p className="text-white font-bold text-sm">{selectedTrick.name}</p>
                  <p className="text-yellow-400 font-bold mt-1">{selectedTrick.experience_reward} XP</p>
                </div>
                {/* Opponent trick */}
                <div className="bg-red-900/40 border border-red-600 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-400 mb-1">{opponentName}</p>
                  <p className="text-white font-bold text-sm">{opponentTrick.name}</p>
                  <p className="text-yellow-400 font-bold mt-1">{opponentTrick.experience_reward} XP</p>
                </div>
              </div>

              {roundResult && (
                <div className={`rounded-lg p-3 text-center border ${
                  roundResult === 'win'
                    ? 'bg-green-900/50 border-green-500'
                    : roundResult === 'lose'
                    ? 'bg-red-900/50 border-red-500'
                    : 'bg-gray-700 border-gray-500'
                }`}>
                  <p className={`font-bold text-lg ${
                    roundResult === 'win' ? 'text-green-300' : roundResult === 'lose' ? 'text-red-300' : 'text-gray-300'
                  }`}>
                    {roundResult === 'win' ? '🏆 Раунд твой!' : roundResult === 'lose' ? '💀 Раунд проигран' : '🤝 Ничья'}
                  </p>
                </div>
              )}

              {roundResult && round < totalRounds && (
                <Button
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={handleNextRound}
                >
                  <Icon name="SkipForward" size={16} className="mr-2" />
                  Следующий раунд
                </Button>
              )}
            </div>
          )}

          {/* Result state */}
          {gameState === 'result' && (
            <div className="space-y-4 text-center">
              <div className={`rounded-xl p-6 border-2 ${
                playerScore > opponentScore
                  ? 'bg-yellow-900/40 border-yellow-500'
                  : playerScore < opponentScore
                  ? 'bg-red-900/40 border-red-500'
                  : 'bg-gray-700 border-gray-500'
              }`}>
                <p className="text-4xl mb-2">
                  {playerScore > opponentScore ? '🏆' : playerScore < opponentScore ? '💀' : '🤝'}
                </p>
                <p className={`text-xl font-bold ${
                  playerScore > opponentScore ? 'text-yellow-300' : playerScore < opponentScore ? 'text-red-300' : 'text-gray-300'
                }`}>
                  {playerScore > opponentScore ? 'Победа!' : playerScore < opponentScore ? 'Поражение' : 'Ничья'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Итог: {playerScore} — {opponentScore}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                <p>
                  Награда: <span className="text-yellow-400 font-bold">
                    {playerScore > opponentScore ? 80 + playerScore * 20 : 20 + playerScore * 10} XP
                  </span>
                  {' '}·{' '}
                  <span className="text-cyan-400 font-bold">
                    {playerScore > opponentScore ? 15 + playerScore * 5 : 5 + playerScore * 2} кинетиков
                  </span>
                </p>
              </div>

              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={handleFinish}
              >
                <Icon name="Trophy" size={16} className="mr-2" />
                Получить награду
              </Button>
            </div>
          )}

          {gameState !== 'result' && (
            <Button
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={onClose}
            >
              Выход
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentArena;
