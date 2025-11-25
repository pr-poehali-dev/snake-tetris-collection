import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

const BreakoutGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const gameState = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 100,
    ballDX: 4,
    ballDY: -4,
    bricks: [] as Array<{ x: number; y: number; status: number; color: string }>,
  });

  const initBricks = () => {
    const colors = ['#9b87f5', '#D946EF', '#F97316', '#0EA5E9', '#10b981'];
    const bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + 30,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + 50,
          status: 1,
          color: colors[row % colors.length],
        });
      }
    }
    return bricks;
  };

  const resetGame = () => {
    gameState.current = {
      paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT - 100,
      ballDX: 4,
      ballDY: -4,
      bricks: initBricks(),
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
  };

  const update = useCallback(() => {
    const state = gameState.current;

    state.ballX += state.ballDX;
    state.ballY += state.ballDY;

    if (state.ballX + BALL_RADIUS > CANVAS_WIDTH || state.ballX - BALL_RADIUS < 0) {
      state.ballDX = -state.ballDX;
    }

    if (state.ballY - BALL_RADIUS < 0) {
      state.ballDY = -state.ballDY;
    }

    if (
      state.ballY + BALL_RADIUS > CANVAS_HEIGHT - PADDLE_HEIGHT &&
      state.ballX > state.paddleX &&
      state.ballX < state.paddleX + PADDLE_WIDTH
    ) {
      const hitPos = (state.ballX - state.paddleX) / PADDLE_WIDTH;
      const angle = (hitPos - 0.5) * Math.PI * 0.6;
      const speed = Math.sqrt(state.ballDX ** 2 + state.ballDY ** 2);
      state.ballDX = speed * Math.sin(angle);
      state.ballDY = -speed * Math.cos(angle);
    }

    if (state.ballY + BALL_RADIUS > CANVAS_HEIGHT) {
      setLives((l) => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setGameOver(true);
          setIsPlaying(false);
        } else {
          state.ballX = CANVAS_WIDTH / 2;
          state.ballY = CANVAS_HEIGHT - 100;
          state.ballDX = 4;
          state.ballDY = -4;
        }
        return newLives;
      });
    }

    state.bricks.forEach((brick) => {
      if (brick.status === 1) {
        if (
          state.ballX > brick.x &&
          state.ballX < brick.x + BRICK_WIDTH &&
          state.ballY > brick.y &&
          state.ballY < brick.y + BRICK_HEIGHT
        ) {
          state.ballDY = -state.ballDY;
          brick.status = 0;
          setScore((s) => s + 10);
        }
      }
    });

    if (state.bricks.every((brick) => brick.status === 0)) {
      setGameOver(true);
      setIsPlaying(false);
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1f2c';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const state = gameState.current;

    state.bricks.forEach((brick) => {
      if (brick.status === 1) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    });

    ctx.fillStyle = '#9b87f5';
    ctx.fillRect(state.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameLoop = setInterval(() => {
      update();
      draw();
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, update, draw]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPlaying || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      gameState.current.paddleX = Math.max(
        0,
        Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2)
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPlaying || !canvasRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      gameState.current.paddleX = Math.max(
        0,
        Math.min(CANVAS_WIDTH - PADDLE_WIDTH, touchX - PADDLE_WIDTH / 2)
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) {
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Trophy" size={24} className="text-accent" />
              <span className="text-2xl font-bold">Очки: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Heart" size={24} className="text-destructive" />
              <span className="text-2xl font-bold">Жизни: {lives}</span>
            </div>
          </div>
          {!isPlaying && !gameOver && (
            <Button onClick={resetGame}>
              <Icon name="Play" size={20} className="mr-2" />
              Начать игру
            </Button>
          )}
          {gameOver && (
            <Button onClick={resetGame} variant={score >= 400 ? 'default' : 'destructive'}>
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Играть снова
            </Button>
          )}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-primary rounded-lg touch-none"
            style={{ maxWidth: '90vw', height: 'auto' }}
          />
          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">
                  {score >= 400 ? 'Победа! 🎉' : 'Игра окончена!'}
                </h2>
                <p className="text-xl text-white">Ваш счёт: {score}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          ПК: Двигайте мышь | Мобильные: Касайтесь экрана
        </div>
      </Card>
    </div>
  );
};

export default BreakoutGame;
