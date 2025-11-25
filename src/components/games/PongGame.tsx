import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;

const PongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0 });

  const gameState = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVelocityX: 5,
    ballVelocityY: 3,
  });

  const resetBall = useCallback(() => {
    gameState.current.ballX = CANVAS_WIDTH / 2;
    gameState.current.ballY = CANVAS_HEIGHT / 2;
    gameState.current.ballVelocityX = (Math.random() > 0.5 ? 1 : -1) * 5;
    gameState.current.ballVelocityY = (Math.random() - 0.5) * 6;
  }, []);

  const resetGame = () => {
    gameState.current = {
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballVelocityX: 5,
      ballVelocityY: 3,
    };
    setScore({ player: 0, ai: 0 });
    setGameOver(false);
    setIsPlaying(true);
  };

  const update = useCallback(() => {
    const state = gameState.current;

    state.ballX += state.ballVelocityX;
    state.ballY += state.ballVelocityY;

    if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT) {
      state.ballVelocityY = -state.ballVelocityY;
    }

    if (state.ballX <= PADDLE_WIDTH) {
      if (state.ballY >= state.playerY && state.ballY <= state.playerY + PADDLE_HEIGHT) {
        state.ballVelocityX = -state.ballVelocityX * 1.05;
        const relativeIntersectY = (state.playerY + PADDLE_HEIGHT / 2) - state.ballY;
        state.ballVelocityY = -relativeIntersectY * 0.3;
      } else {
        setScore(s => {
          const newScore = { ...s, ai: s.ai + 1 };
          if (newScore.ai >= 5) {
            setGameOver(true);
            setIsPlaying(false);
          }
          return newScore;
        });
        resetBall();
      }
    }

    if (state.ballX >= CANVAS_WIDTH - PADDLE_WIDTH) {
      if (state.ballY >= state.aiY && state.ballY <= state.aiY + PADDLE_HEIGHT) {
        state.ballVelocityX = -state.ballVelocityX * 1.05;
        const relativeIntersectY = (state.aiY + PADDLE_HEIGHT / 2) - state.ballY;
        state.ballVelocityY = -relativeIntersectY * 0.3;
      } else {
        setScore(s => {
          const newScore = { ...s, player: s.player + 1 };
          if (newScore.player >= 5) {
            setGameOver(true);
            setIsPlaying(false);
          }
          return newScore;
        });
        resetBall();
      }
    }

    const aiSpeed = 4;
    if (state.aiY + PADDLE_HEIGHT / 2 < state.ballY) {
      state.aiY += aiSpeed;
    } else {
      state.aiY -= aiSpeed;
    }
    state.aiY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY));
  }, [resetBall]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1f2c';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#9b87f5';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    const state = gameState.current;

    ctx.fillStyle = '#9b87f5';
    ctx.fillRect(0, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = '#D946EF';
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_SIZE, 0, Math.PI * 2);
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
      const mouseY = e.clientY - rect.top;
      gameState.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPlaying || !canvasRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const touchY = touch.clientY - rect.top;
      gameState.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, touchY - PADDLE_HEIGHT / 2));
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
    <div className="flex flex-col items-center gap-6" ref={containerRef}>
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Игрок</div>
              <div className="text-3xl font-bold text-primary">{score.player}</div>
            </div>
            <div className="text-2xl text-muted-foreground">:</div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Компьютер</div>
              <div className="text-3xl font-bold text-secondary">{score.ai}</div>
            </div>
          </div>
          {!isPlaying && !gameOver && (
            <Button onClick={resetGame}>
              <Icon name="Play" size={20} className="mr-2" />
              Начать игру
            </Button>
          )}
          {gameOver && (
            <Button onClick={resetGame} variant={score.player > score.ai ? 'default' : 'destructive'}>
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
                  {score.player > score.ai ? 'Победа!' : 'Поражение!'}
                </h2>
                <p className="text-xl text-white">
                  {score.player} : {score.ai}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          ПК: Двигайте мышь | Мобильные: Касайтесь экрана | Первый до 5 очков!
        </div>
      </Card>
    </div>
  );
};

export default PongGame;