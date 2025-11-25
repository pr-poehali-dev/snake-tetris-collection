import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

const COLORS = ['#9b87f5', '#D946EF', '#F97316', '#0EA5E9', '#10b981', '#f59e0b', '#ef4444'];

type Board = number[][];
type Position = { x: number; y: number };

const createEmptyBoard = (): Board => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const TetrisGame = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<number[][]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [currentColor, setCurrentColor] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const getRandomPiece = () => {
    const index = Math.floor(Math.random() * SHAPES.length);
    return { shape: SHAPES[index], color: index };
  };

  const checkCollision = useCallback((piece: number[][], pos: Position, currentBoard: Board) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newY = pos.y + y;
          const newX = pos.x + x;
          if (newY >= BOARD_HEIGHT || newX < 0 || newX >= BOARD_WIDTH || (newY >= 0 && currentBoard[newY][newX])) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPosition.y + y;
          const boardX = currentPosition.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT) {
            newBoard[boardY][boardX] = currentColor + 1;
          }
        }
      });
    });

    const clearedBoard = newBoard.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - clearedBoard.length;
    const emptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(0));
    setBoard([...emptyRows, ...clearedBoard]);
    setScore(s => s + linesCleared * 100);

    const { shape, color } = getRandomPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    if (checkCollision(shape, startPos, [...emptyRows, ...clearedBoard])) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setCurrentPiece(shape);
      setCurrentPosition(startPos);
      setCurrentColor(color);
    }
  }, [board, currentPiece, currentPosition, currentColor, checkCollision]);

  const movePiece = useCallback((dx: number, dy: number) => {
    const newPos = { x: currentPosition.x + dx, y: currentPosition.y + dy };
    if (!checkCollision(currentPiece, newPos, board)) {
      setCurrentPosition(newPos);
    } else if (dy > 0) {
      mergePiece();
    }
  }, [currentPiece, currentPosition, board, checkCollision, mergePiece]);

  const rotatePiece = useCallback(() => {
    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[i]).reverse()
    );
    if (!checkCollision(rotated, currentPosition, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPosition, board, checkCollision]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    const { shape, color } = getRandomPiece();
    setCurrentPiece(shape);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    setCurrentColor(color);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      movePiece(0, 1);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, movePiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotatePiece]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isPlaying || gameOver) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX < 20 && absDeltaY < 20) {
      rotatePiece();
    } else if (absDeltaX > absDeltaY) {
      movePiece(deltaX > 0 ? 1 : -1, 0);
    } else {
      movePiece(0, 1);
    }
    touchStartRef.current = null;
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = currentPosition.y + y;
          const boardX = currentPosition.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = currentColor + 1;
          }
        }
      });
    });

    return displayBoard;
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
          className="relative border-4 border-primary rounded-lg overflow-hidden touch-none"
          style={{
            width: BOARD_WIDTH * CELL_SIZE,
            height: BOARD_HEIGHT * CELL_SIZE,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            maxWidth: '90vw',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderBoard().map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="absolute border border-white/5"
                style={{
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: cell ? COLORS[cell - 1] : 'transparent',
                }}
              />
            ))
          )}
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
          ПК: ←→ Движение, ↑ Поворот, ↓ Ускорить | Мобильные: Свайпы, тап для поворота
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 md:hidden">
          <Button
            size="lg"
            variant="outline"
            onClick={() => movePiece(-1, 0)}
            disabled={!isPlaying || gameOver}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => movePiece(1, 0)}
            disabled={!isPlaying || gameOver}
          >
            <Icon name="ArrowRight" size={24} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={rotatePiece}
            disabled={!isPlaying || gameOver}
          >
            <Icon name="RotateCw" size={24} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => movePiece(0, 1)}
            disabled={!isPlaying || gameOver}
          >
            <Icon name="ArrowDown" size={24} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TetrisGame;