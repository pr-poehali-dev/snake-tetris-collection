import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const GRID_SIZE = 4;
const CELL_SIZE = 100;

type Board = number[][];

const createEmptyBoard = (): Board => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const addRandomTile = (board: Board): Board => {
  const emptySpaces: Array<[number, number]> = [];
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === 0) emptySpaces.push([i, j]);
    });
  });

  if (emptySpaces.length > 0) {
    const [i, j] = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }
  return board;
};

const getTileColor = (value: number): string => {
  const colors: { [key: number]: string } = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  };
  return colors[value] || '#3c3a32';
};

const Game2048 = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const canMove = useCallback((board: Board): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) return true;
        if (j < GRID_SIZE - 1 && board[i][j] === board[i][j + 1]) return true;
        if (i < GRID_SIZE - 1 && board[i][j] === board[i + 1][j]) return true;
      }
    }
    return false;
  }, []);

  const moveTiles = useCallback((board: Board, direction: 'up' | 'down' | 'left' | 'right'): { board: Board; moved: boolean; points: number } => {
    let newBoard = board.map(row => [...row]);
    let moved = false;
    let points = 0;

    const slide = (arr: number[]): { arr: number[]; points: number } => {
      const filtered = arr.filter(x => x !== 0);
      let localPoints = 0;
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          localPoints += filtered[i];
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < GRID_SIZE) {
        filtered.push(0);
      }
      return { arr: filtered, points: localPoints };
    };

    if (direction === 'left') {
      newBoard = newBoard.map(row => {
        const { arr, points: p } = slide(row);
        points += p;
        return arr;
      });
    } else if (direction === 'right') {
      newBoard = newBoard.map(row => {
        const { arr, points: p } = slide(row.reverse());
        points += p;
        return arr.reverse();
      });
    } else if (direction === 'up') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const column = newBoard.map(row => row[j]);
        const { arr, points: p } = slide(column);
        points += p;
        arr.forEach((val, i) => {
          newBoard[i][j] = val;
        });
      }
    } else if (direction === 'down') {
      for (let j = 0; j < GRID_SIZE; j++) {
        const column = newBoard.map(row => row[j]).reverse();
        const { arr, points: p } = slide(column);
        points += p;
        arr.reverse().forEach((val, i) => {
          newBoard[i][j] = val;
        });
      }
    }

    moved = JSON.stringify(board) !== JSON.stringify(newBoard);
    return { board: newBoard, moved, points };
  }, []);

  const resetGame = () => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying || gameOver) return;

    const { board: newBoard, moved, points } = moveTiles(board, direction);
    if (moved) {
      const boardWithNewTile = addRandomTile(newBoard);
      setBoard(boardWithNewTile);
      setScore(s => s + points);

      if (!canMove(boardWithNewTile)) {
        setGameOver(true);
        setIsPlaying(false);
      }
    }
  }, [board, isPlaying, gameOver, moveTiles, canMove]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMove('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, handleMove]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="p-6">
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
          className="relative rounded-lg p-2 bg-[#bbada0]"
          style={{
            width: GRID_SIZE * CELL_SIZE + 16,
            height: GRID_SIZE * CELL_SIZE + 16,
          }}
        >
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center justify-center font-bold rounded transition-all"
                  style={{
                    width: CELL_SIZE - 8,
                    height: CELL_SIZE - 8,
                    backgroundColor: cell ? getTileColor(cell) : '#cdc1b4',
                    color: cell > 4 ? '#f9f6f2' : '#776e65',
                    fontSize: cell >= 1000 ? '32px' : cell >= 100 ? '40px' : '48px',
                    transform: cell ? 'scale(1)' : 'scale(0.9)',
                  }}
                >
                  {cell || ''}
                </div>
              ))
            )}
          </div>
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">Игра окончена!</h2>
                <p className="text-xl text-white">Ваш счёт: {score}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Используйте стрелки для управления
        </div>
      </Card>
    </div>
  );
};

export default Game2048;
