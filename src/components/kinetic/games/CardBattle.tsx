import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Trick, Character, DIFFICULTY_NAMES, DIFFICULTY_COLORS } from '@/types/kinetic';
import { Badge } from '@/components/ui/badge';

interface CardBattleProps {
  tricks: Trick[];
  character: Character;
  onComplete: (earnedXP: number, earnedKinetics: number, won: boolean) => void;
  onClose: () => void;
}

const CardBattle = ({ tricks, character, onComplete, onClose }: CardBattleProps) => {
  function getRandomCards(count: number): Trick[] {
    if (tricks.length === 0) return [];
    const shuffled = [...tricks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, tricks.length));
  }

  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [playerHand, setPlayerHand] = useState<Trick[]>(getRandomCards(5));
  const [opponentHand] = useState<Trick[]>(getRandomCards(5));
  const [playerField, setPlayerField] = useState<Trick | null>(null);
  const [opponentField, setOpponentField] = useState<Trick | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [round, setRound] = useState(1);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const totalRounds = 3;

  const getCardPower = (trick: Trick): number => {
    const difficultyPower: Record<string, number> = { novice: 1, amateur: 2, pro: 3, legend: 4 };
    return (difficultyPower[trick.difficulty] || 1) * 10 + trick.experience_reward;
  };

  const playCard = (trick: Trick) => {
    if (isResolving || gameState !== 'playing') return;

    const newPlayerHand = playerHand.filter(t => t.id !== trick.id);
    setPlayerHand(newPlayerHand);
    setPlayerField(trick);
    setIsResolving(true);

    // Pick opponent card
    const availableOpponentCards = opponentHand.filter(c => c.id !== trick.id);
    const pool = availableOpponentCards.length > 0 ? availableOpponentCards : opponentHand;
    const opponentCard = pool[Math.floor(Math.random() * pool.length)];
    setOpponentField(opponentCard);

    setTimeout(() => {
      const playerPower = getCardPower(trick);
      const opponentPower = getCardPower(opponentCard);

      let result: 'win' | 'lose' | 'draw';
      let newPlayerScore = playerScore;
      let newOpponentScore = opponentScore;

      if (playerPower > opponentPower) {
        newPlayerScore += 1;
        setPlayerScore(newPlayerScore);
        result = 'win';
      } else if (opponentPower > playerPower) {
        newOpponentScore += 1;
        setOpponentScore(newOpponentScore);
        result = 'lose';
      } else {
        result = 'draw';
      }

      setRoundResult(result);

      if (round >= totalRounds || newPlayerHand.length === 0) {
        setTimeout(() => {
          setGameState('result');
          setIsResolving(false);
        }, 1500);
      } else {
        setTimeout(() => {
          setRound(prev => prev + 1);
          setPlayerField(null);
          setOpponentField(null);
          setRoundResult(null);
          setIsResolving(false);
        }, 1500);
      }
    }, 800);
  };

  const handleFinish = () => {
    const won = playerScore > opponentScore;
    const earnedXP = won ? 100 + playerScore * 25 : 25 + playerScore * 10;
    const earnedKinetics = won ? 20 + playerScore * 5 : 5 + playerScore * 2;
    onComplete(earnedXP, earnedKinetics, won);
  };

  const TrickCard = ({
    trick,
    onClick,
    disabled,
    glow,
  }: {
    trick: Trick;
    onClick?: () => void;
    disabled?: boolean;
    glow?: 'green' | 'red' | 'none';
  }) => {
    const power = getCardPower(trick);
    const glowClass =
      glow === 'green'
        ? 'border-green-500 shadow-green-500/40 shadow-lg'
        : glow === 'red'
        ? 'border-red-500 shadow-red-500/40 shadow-lg'
        : 'border-gray-600';

    return (
      <button
        className={`rounded-lg border-2 p-2 text-left transition-all bg-gray-800 hover:bg-gray-700 ${glowClass} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 hover:shadow-purple-400/20 hover:shadow-md'
        }`}
        onClick={onClick}
        disabled={disabled}
      >
        <p className="text-white font-semibold text-xs leading-tight mb-1">{trick.name}</p>
        <Badge className={`text-[10px] px-1 py-0 ${DIFFICULTY_COLORS[trick.difficulty]}`}>
          {DIFFICULTY_NAMES[trick.difficulty]}
        </Badge>
        <div className="mt-1 flex justify-between items-center">
          <span className="text-[10px] text-gray-400">+{trick.experience_reward} XP</span>
          <span className="text-[11px] font-bold text-yellow-400">{power}⚡</span>
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-gray-900 border-blue-500/50 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-blue-300 flex items-center gap-2">
            <Icon name="Swords" size={20} />
            Битва карточек
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="X" size={18} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Score bar */}
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">{character.name}</p>
              <p className="text-2xl font-bold text-green-400">{playerScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Раунд {Math.min(round, totalRounds)}/{totalRounds}</p>
              <p className="text-base text-gray-300 font-semibold">VS</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Противник</p>
              <p className="text-2xl font-bold text-red-400">{opponentScore}</p>
            </div>
          </div>

          {/* Battle field */}
          {(playerField || opponentField) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1 text-center">Ты сыграл:</p>
                {playerField && (
                  <TrickCard
                    trick={playerField}
                    disabled
                    glow={
                      roundResult === 'win' ? 'green' : roundResult === 'lose' ? 'red' : 'none'
                    }
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 text-center">Противник:</p>
                {opponentField && (
                  <TrickCard
                    trick={opponentField}
                    disabled
                    glow={
                      roundResult === 'lose' ? 'green' : roundResult === 'win' ? 'red' : 'none'
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Round result banner */}
          {roundResult && gameState === 'playing' && (
            <div className={`rounded-lg p-2 text-center border text-sm font-bold ${
              roundResult === 'win'
                ? 'bg-green-900/50 border-green-500 text-green-300'
                : roundResult === 'lose'
                ? 'bg-red-900/50 border-red-500 text-red-300'
                : 'bg-gray-700 border-gray-500 text-gray-300'
            }`}>
              {roundResult === 'win' ? '🏆 Ты выиграл раунд!' : roundResult === 'lose' ? '💀 Раунд проигран' : '🤝 Ничья в этом раунде'}
            </div>
          )}

          {/* Player hand */}
          {gameState === 'playing' && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Твои карты — выбери одну:</p>
              {playerHand.length === 0 ? (
                <p className="text-center text-gray-500 py-3 text-sm">Карты закончились</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {playerHand.map(trick => (
                    <TrickCard
                      key={trick.id}
                      trick={trick}
                      onClick={() => playCard(trick)}
                      disabled={isResolving}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Final result */}
          {gameState === 'result' && (
            <div className="space-y-4 text-center">
              <div className={`rounded-xl p-5 border-2 ${
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
                  playerScore > opponentScore
                    ? 'text-yellow-300'
                    : playerScore < opponentScore
                    ? 'text-red-300'
                    : 'text-gray-300'
                }`}>
                  {playerScore > opponentScore ? 'Победа!' : playerScore < opponentScore ? 'Поражение' : 'Ничья'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Счёт: {playerScore} — {opponentScore}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                <p>
                  Награда:{' '}
                  <span className="text-yellow-400 font-bold">
                    {playerScore > opponentScore ? 100 + playerScore * 25 : 25 + playerScore * 10} XP
                  </span>
                  {' '}·{' '}
                  <span className="text-cyan-400 font-bold">
                    {playerScore > opponentScore ? 20 + playerScore * 5 : 5 + playerScore * 2} кинетиков
                  </span>
                </p>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
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

export default CardBattle;
