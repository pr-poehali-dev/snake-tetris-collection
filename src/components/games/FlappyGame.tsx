import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;

const FlappyGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const gameState = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as Array<{ x: number; topHeight: number }>,
    pipeTimer: 0,
  });

  const jump = useCallback(() => {
    if (!isPlaying || gameOver) return;
    gameState.current.birdVelocity = JUMP_STRENGTH;
  }, [isPlaying, gameOver]);

  const resetGame = () => {
    gameState.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      pipeTimer: 0,
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const update = useCallback(() => {
    const state = gameState.current;

    state.birdVelocity += GRAVITY;
    state.birdY += state.birdVelocity;

    if (state.birdY < 0 || state.birdY > CANVAS_HEIGHT - BIRD_SIZE) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    state.pipeTimer++;
    if (state.pipeTimer > 90) {
      state.pipes.push({
        x: CANVAS_WIDTH,
        topHeight: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50,
      });
      state.pipeTimer = 0;
    }

    state.pipes.forEach((pipe) => {
      pipe.x -= 3;

      if (
        pipe.x < BIRD_SIZE + 50 &&
        pipe.x + PIPE_WIDTH > 50 &&
        (state.birdY < pipe.topHeight || state.birdY + BIRD_SIZE > pipe.topHeight + PIPE_GAP)
      ) {
        setGameOver(true);
        setIsPlaying(false);
      }

      if (pipe.x + PIPE_WIDTH === 50) {
        setScore((s) => s + 1);
      }
    });

    state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const state = gameState.current;

    state.pipes.forEach((pipe) => {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#059669';
      ctx.fillRect(pipe.x, pipe.topHeight - 10, PIPE_WIDTH, 10);
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, 10);
    });

    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(50 + BIRD_SIZE / 2, state.birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(60, state.birdY + 15, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(62, state.birdY + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(45, state.birdY + 25);
    ctx.lineTo(40, state.birdY + 30);
    ctx.lineTo(50, state.birdY + 28);
    ctx.closePath();
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
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

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

        <div className="relative" onClick={jump} onTouchStart={jump}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-primary rounded-lg cursor-pointer touch-none"
            style={{ maxWidth: '90vw', height: 'auto' }}
          />
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
          ПК: Пробел | Мобильные: Тап по экрану
        </div>

        <div className="mt-4 md:hidden">
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={jump}
            disabled={!isPlaying || gameOver}
          >
            <Icon name="ArrowUp" size={24} className="mr-2" />
            Прыжок
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FlappyGame;
