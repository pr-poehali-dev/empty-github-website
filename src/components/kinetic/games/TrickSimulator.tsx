import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Trick } from '@/types/kinetic';

interface TrickSimulatorProps {
  tricks: Trick[];
  onComplete: (earnedXP: number, earnedKinetics: number, won: boolean) => void;
  onClose: () => void;
}

const TrickSimulator = ({ tricks, onComplete, onClose }: TrickSimulatorProps) => {
  const [currentTrick, setCurrentTrick] = useState<Trick | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'ready' | 'showing' | 'playing' | 'success' | 'fail'>('ready');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const buttons = ['⬆️', '⬇️', '⬅️', '➡️', '🔄'];

  useEffect(() => {
    if (tricks.length > 0) {
      selectRandomTrick();
    }
  }, []);

  const selectRandomTrick = () => {
    const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
    setCurrentTrick(randomTrick);
  };

  const startGame = () => {
    const length = Math.min(3 + round, 7);
    const newSequence = Array.from({ length }, () => buttons[Math.floor(Math.random() * buttons.length)]);
    setSequence(newSequence);
    setPlayerSequence([]);
    setGameState('showing');
    showSequence(newSequence);
  };

  const showSequence = async (seq: string[]) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveIndex(i);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveIndex(null);
    }
    setGameState('playing');
  };

  const handleButtonClick = (button: string) => {
    if (gameState !== 'playing') return;

    const newPlayerSequence = [...playerSequence, button];
    setPlayerSequence(newPlayerSequence);

    if (button !== sequence[playerSequence.length]) {
      setGameState('fail');
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const trickXP = currentTrick ? currentTrick.experience_reward : 10;
      const trickKinetics = currentTrick ? currentTrick.kinetics_reward : 5;
      setScore(prev => prev + trickXP);
      setGameState('success');
    }
  };

  const handleNextRound = () => {
    setRound(prev => prev + 1);
    selectRandomTrick();
    setPlayerSequence([]);
    setGameState('ready');
  };

  const handleFinish = () => {
    const earnedXP = score;
    const earnedKinetics = Math.floor(score / 2);
    const won = score > 0;
    onComplete(earnedXP, earnedKinetics, won);
  };

  const maxRounds = 3;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-purple-500/50 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-purple-300 flex items-center gap-2">
            <Icon name="Gamepad2" size={20} />
            Симулятор трюков
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Round & Score */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>Раунд: <span className="text-white font-semibold">{round} / {maxRounds}</span></span>
            <span>Очки: <span className="text-yellow-400 font-semibold">{score}</span></span>
          </div>

          {/* Current Trick */}
          {currentTrick && (
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Текущий трюк</p>
              <p className="text-white font-bold">{currentTrick.name}</p>
              <p className="text-xs text-purple-300 mt-1">
                +{currentTrick.experience_reward} XP · +{currentTrick.kinetics_reward} кинетиков
              </p>
            </div>
          )}

          {/* Sequence display */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2 text-center">
              {gameState === 'showing' ? 'Запоминай последовательность...' : 'Последовательность:'}
            </p>
            <div className="flex gap-2 flex-wrap justify-center min-h-[40px]">
              {gameState === 'showing' || gameState === 'playing' || gameState === 'success' || gameState === 'fail'
                ? sequence.map((btn, idx) => (
                    <span
                      key={idx}
                      className={`text-2xl transition-all duration-200 ${
                        gameState === 'showing' && activeIndex === idx
                          ? 'scale-150 opacity-100'
                          : gameState === 'showing'
                          ? 'opacity-30'
                          : gameState === 'playing'
                          ? idx < playerSequence.length
                            ? 'opacity-100'
                            : 'opacity-40'
                          : 'opacity-100'
                      }`}
                    >
                      {btn}
                    </span>
                  ))
                : <span className="text-gray-500 text-sm">Нажми "Начать" чтобы играть</span>
              }
            </div>
          </div>

          {/* Player progress */}
          {gameState === 'playing' && (
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2 text-center">Твой ввод ({playerSequence.length}/{sequence.length}):</p>
              <div className="flex gap-2 flex-wrap justify-center min-h-[32px]">
                {playerSequence.map((btn, idx) => (
                  <span key={idx} className="text-xl">{btn}</span>
                ))}
              </div>
            </div>
          )}

          {/* Result messages */}
          {gameState === 'success' && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 text-center">
              <p className="text-green-300 font-bold text-lg">Трюк выполнен! 🎉</p>
              <p className="text-gray-300 text-sm mt-1">+{currentTrick?.experience_reward ?? 10} XP заработано</p>
            </div>
          )}

          {gameState === 'fail' && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-center">
              <p className="text-red-300 font-bold text-lg">Неверно! 💥</p>
              <p className="text-gray-300 text-sm mt-1">Попробуй снова</p>
            </div>
          )}

          {/* Control buttons */}
          {gameState === 'playing' && (
            <div className="grid grid-cols-3 gap-2">
              {buttons.map(btn => (
                <Button
                  key={btn}
                  variant="outline"
                  className="text-2xl h-14 bg-gray-800 border-gray-600 hover:bg-purple-800 hover:border-purple-400"
                  onClick={() => handleButtonClick(btn)}
                >
                  {btn}
                </Button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {gameState === 'ready' && (
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={startGame}
                disabled={tricks.length === 0}
              >
                <Icon name="Play" size={16} className="mr-2" />
                Начать
              </Button>
            )}

            {(gameState === 'success' || gameState === 'fail') && round < maxRounds && (
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleNextRound}
              >
                <Icon name="SkipForward" size={16} className="mr-2" />
                Следующий раунд
              </Button>
            )}

            {(gameState === 'fail') && (
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={startGame}
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Повторить
              </Button>
            )}

            {(gameState === 'success' || gameState === 'fail') && round >= maxRounds && (
              <Button
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                onClick={handleFinish}
              >
                <Icon name="Trophy" size={16} className="mr-2" />
                Завершить игру
              </Button>
            )}

            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={onClose}
            >
              Выход
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrickSimulator;
