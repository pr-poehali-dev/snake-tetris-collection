import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

type Position = { x: number; y: number };

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const checkCollision = (head: Position) => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    for (const segment of snake) {
      if (segment.x === head.x && segment.y === head.y) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        if (checkCollision(newHead)) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood());
          setScore((s) => s + 10);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [direction, food, isPlaying, gameOver, generateFood, snake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  const handleChangeDirection = (newDir: Position) => {
    if (!isPlaying) return;
    if (newDir.x !== 0 && direction.x === 0) setDirection(newDir);
    if (newDir.y !== 0 && direction.y === 0) setDirection(newDir);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > 30 || absDeltaY > 30) {
      if (absDeltaX > absDeltaY) {
        handleChangeDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        handleChangeDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="Trophy" size={24} className="text-accent" />
            <span className="text-2xl font-bold">Очки: {score}</span>
          </div>
          {!isPlaying && !gameOver && (
            <Button onClick={resetGame}>
              <Icon name="Play" size={20} className="mr-2" />
              Начать игру
            </Button>
          )}
          {gameOver && (
            <Button onClick={resetGame} variant="destructive">
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
          )}
        </div>

        <div
          className="relative border-4 border-primary rounded-lg touch-none"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            maxWidth: '90vw',
            aspectRatio: '1',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute transition-all"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                backgroundColor: index === 0 ? '#9b87f5' : '#7E69AB',
                borderRadius: '2px',
              }}
            />
          ))}
          <div
            className="absolute animate-pulse"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              backgroundColor: '#F97316',
              borderRadius: '50%',
            }}
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">Игра окончена!</h2>
                <p className="text-xl text-white">Ваш счёт: {score}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          ПК: Стрелки | Мобильные: Свайпы
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
          <div />
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleChangeDirection({ x: 0, y: -1 })}
            disabled={!isPlaying}
          >
            <Icon name="ArrowUp" size={24} />
          </Button>
          <div />
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleChangeDirection({ x: -1, y: 0 })}
            disabled={!isPlaying}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <div />
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleChangeDirection({ x: 1, y: 0 })}
            disabled={!isPlaying}
          >
            <Icon name="ArrowRight" size={24} />
          </Button>
          <div />
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleChangeDirection({ x: 0, y: 1 })}
            disabled={!isPlaying}
          >
            <Icon name="ArrowDown" size={24} />
          </Button>
          <div />
        </div>
      </Card>
    </div>
  );
};

export default SnakeGame;