import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const ICONS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤'];
const CARD_SIZE = 80;

type CardType = {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
};

const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const initializeGame = () => {
    const shuffled = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        flipped: false,
        matched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setIsPlaying(true);
    setGameOver(false);
  };

  const handleCardClick = (id: number) => {
    if (!isPlaying || gameOver) return;
    if (flippedCards.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;
    if (flippedCards.includes(id)) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].icon === newCards[second].icon) {
        setTimeout(() => {
          newCards[first].matched = true;
          newCards[second].matched = true;
          setCards(newCards);
          setFlippedCards([]);

          if (newCards.every((card) => card.matched)) {
            setGameOver(true);
            setIsPlaying(false);
          }
        }, 500);
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Icon name="Brain" size={24} className="text-accent" />
            <span className="text-2xl font-bold">Ходы: {moves}</span>
          </div>
          {!isPlaying && !gameOver && (
            <Button onClick={initializeGame}>
              <Icon name="Play" size={20} className="mr-2" />
              Начать игру
            </Button>
          )}
          {gameOver && (
            <Button onClick={initializeGame} variant="default">
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
          )}
          {isPlaying && (
            <Button onClick={initializeGame} variant="outline" size="sm">
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Новая игра
            </Button>
          )}
        </div>

        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(4, ${CARD_SIZE}px)`,
            maxWidth: '90vw',
          }}
        >
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={!isPlaying || card.matched || card.flipped}
              className="relative transition-all transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                perspective: '1000px',
              }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 ${
                  card.flipped || card.matched ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: card.flipped || card.matched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div
                  className="absolute w-full h-full rounded-lg flex items-center justify-center text-4xl font-bold border-4 border-primary"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%)',
                  }}
                >
                  ?
                </div>
                <div
                  className={`absolute w-full h-full rounded-lg flex items-center justify-center text-4xl border-4 ${
                    card.matched ? 'border-accent bg-accent/20' : 'border-primary bg-card'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {gameOver && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 text-center">
            <h3 className="text-2xl font-bold mb-2">Поздравляем! 🎉</h3>
            <p className="text-lg">Вы завершили игру за {moves} ходов!</p>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Найдите все пары карточек
        </div>
      </Card>
    </div>
  );
};

export default MemoryGame;
