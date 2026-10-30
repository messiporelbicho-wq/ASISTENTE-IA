import React, { useRef, useState, useEffect } from 'react';
import { LegendPlayer } from '../types/game';
import { sounds } from '../utils/audio';
import { Trophy, RotateCcw, ArrowLeft, Zap, ShieldAlert, Award } from 'lucide-react';

interface DribbleRunnerGameProps {
  player: LegendPlayer;
  onBackToMenu: () => void;
  onHighScore: (score: number) => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'defender' | 'slide_tackle' | 'cone' | 'coin';
  collected?: boolean;
}

export const DribbleRunnerGame: React.FC<DribbleRunnerGameProps> = ({
  player,
  onBackToMenu,
  onHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [stamina, setStamina] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const WIDTH = 640;
  const HEIGHT = 580;

  // Dribbler state
  const dribblerRef = useRef({
    x: WIDTH / 2,
    y: HEIGHT - 90,
    targetX: WIDTH / 2,
    vx: 0,
    radius: 20,
    jumpY: 0,
    jumpVy: 0,
    jumping: false,
    speed: 6.5 + player.speed * 0.3,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchXRef = useRef<number | null>(null);
  const scrollOffsetRef = useRef(0);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code) && !dribblerRef.current.jumping) {
        dribblerRef.current.jumping = true;
        dribblerRef.current.jumpVy = -9;
        setIsJumping(true);
        sounds.playJump();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop
  useEffect(() => {
    let animId: number;
    let spawnTimer = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (!gameOver) {
        const dribbler = dribblerRef.current;
        const keys = keysRef.current;

        // Distance & pitch scroll
        setDistance((d) => d + 1);
        scrollOffsetRef.current = (scrollOffsetRef.current + 5) % 80;

        // Movement Left / Right
        if (keys['ArrowLeft'] || keys['KeyA']) {
          dribbler.x -= dribbler.speed;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          dribbler.x += dribbler.speed;
        }

        // Touch drag control
        if (touchXRef.current !== null) {
          const dx = touchXRef.current - dribbler.x;
          dribbler.x += Math.sign(dx) * Math.min(Math.abs(dx), dribbler.speed);
        }

        // Clamp inside pitch lines
        const PITCH_LEFT = 60;
        const PITCH_RIGHT = WIDTH - 60;
        if (dribbler.x < PITCH_LEFT) dribbler.x = PITCH_LEFT;
        if (dribbler.x > PITCH_RIGHT) dribbler.x = PITCH_RIGHT;

        // Jump physics
        if (dribbler.jumping) {
          dribbler.jumpY += dribbler.jumpVy;
          dribbler.jumpVy += 0.55;
          if (dribbler.jumpY >= 0) {
            dribbler.jumpY = 0;
            dribbler.jumping = false;
            setIsJumping(false);
          }
        }

        // Spawn obstacles & items
        spawnTimer++;
        if (spawnTimer % 45 === 0) {
          const rand = Math.random();
          const spawnX = PITCH_LEFT + 30 + Math.random() * (PITCH_RIGHT - PITCH_LEFT - 60);

          if (rand < 0.45) {
            // Defender charging down
            obstaclesRef.current.push({
              x: spawnX,
              y: -50,
              width: 32,
              height: 38,
              speed: 4.5 + Math.random() * 2,
              type: 'defender',
            });
          } else if (rand < 0.7) {
            // Low sliding tackle (must be jumped over!)
            obstaclesRef.current.push({
              x: spawnX,
              y: -50,
              width: 52,
              height: 18,
              speed: 6.2,
              type: 'slide_tackle',
            });
          } else {
            // Golden Ball / Coin
            obstaclesRef.current.push({
              x: spawnX,
              y: -50,
              width: 22,
              height: 22,
              speed: 3.5,
              type: 'coin',
            });
          }
        }

        // Update obstacles
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.y += obs.speed;

          // Collision checking with dribbler
          const dribblerY = dribbler.y + dribbler.jumpY;
          const hit =
            Math.abs(obs.x - dribbler.x) < (obs.width / 2 + dribbler.radius) &&
            Math.abs(obs.y - dribblerY) < (obs.height / 2 + dribbler.radius);

          if (hit && !obs.collected) {
            if (obs.type === 'coin') {
              obs.collected = true;
              setScore((s) => s + 50);
              sounds.playKick(0.5);
              obstaclesRef.current.splice(i, 1);
              continue;
            } else if (obs.type === 'slide_tackle' && dribbler.jumping) {
              // Successfully jumped over slide tackle!
              setScore((s) => s + 30);
            } else {
              // Tackled / Hit!
              sounds.playKick(1.2);
              setGameOver(true);
              onHighScore(score);
              break;
            }
          }

          // Offscreen cull
          if (obs.y > HEIGHT + 60) {
            obstaclesRef.current.splice(i, 1);
            setScore((s) => s + 10); // Dodged obstacle bonus
          }
        }
      }

      // RENDER
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Pitch Grass Background
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Grass stripes scrolling vertically
      ctx.fillStyle = '#166534';
      for (let y = -80 + scrollOffsetRef.current; y < HEIGHT + 80; y += 80) {
        ctx.fillRect(0, y, WIDTH, 40);
      }

      // White touchlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, HEIGHT);
      ctx.moveTo(WIDTH - 60, 0);
      ctx.lineTo(WIDTH - 60, HEIGHT);
      ctx.stroke();

      // Obstacles
      obstaclesRef.current.forEach((obs) => {
        ctx.save();
        ctx.translate(obs.x, obs.y);

        if (obs.type === 'coin') {
          // Golden Ballon d'Or
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', 0, 3.5);
        } else if (obs.type === 'slide_tackle') {
          // Red Slide Tackler on turf
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 4);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(obs.width / 2 - 8, 0, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standing Defender
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.roundRect(-14, -18, 28, 36, 6);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(0, -22, 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Player Dribbler
      const dribbler = dribblerRef.current;
      ctx.save();
      ctx.translate(dribbler.x, dribbler.y + dribbler.jumpY);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 24 - dribbler.jumpY, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Body
      ctx.fillStyle = player.shirtColor;
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 36, 6);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Player Head
      ctx.fillStyle = player.skinColor;
      ctx.beginPath();
      ctx.arc(0, -24, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = player.hairColor;
      ctx.beginPath();
      ctx.arc(0, -28, 14, Math.PI, Math.PI * 2);
      ctx.fill();

      // Ball in front of player feet
      ctx.translate(0, 28);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, player, score, onHighScore]);

  const handleRestart = () => {
    setScore(0);
    setDistance(0);
    setGameOver(false);
    obstaclesRef.current = [];
    dribblerRef.current.x = WIDTH / 2;
    dribblerRef.current.jumpY = 0;
    dribblerRef.current.jumping = false;
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full px-4 py-3 mb-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
        <div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">Puntos</div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Distancia</div>
          <div className="text-xl font-bold text-sky-400 tabular-nums">{Math.floor(distance / 5)} m</div>
        </div>
        <button
          onClick={onBackToMenu}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700"
        >
          Menú
        </button>
      </div>

      {/* Main Pitch Runner */}
      <div
        className="relative w-full overflow-hidden border border-slate-800 rounded-2xl shadow-2xl bg-slate-950 aspect-[4/3] touch-none"
        onTouchMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            touchXRef.current = ((e.touches[0].clientX - rect.left) / rect.width) * WIDTH;
          }
        }}
        onTouchEnd={() => (touchXRef.current = null)}
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full h-full object-contain" />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="flex flex-col items-center max-w-xs w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-rose-500 mb-2" />
              <h3 className="text-2xl font-black text-white">¡Entrada Fuerte!</h3>
              <p className="text-slate-400 text-xs mt-1">El defensa rival te quitó el balón</p>
              <div className="my-4 text-3xl font-extrabold text-amber-400 tabular-nums">{score} pts</div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
                <button
                  onClick={onBackToMenu}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all border border-slate-700"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control hints */}
      <div className="flex items-center justify-between w-full mt-2 px-3 py-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl">
        <span>Controles: A / D o Flechas para esquivar · ESPACIO / W para saltar barridas</span>
        <button
          onClick={() => {
            if (!dribblerRef.current.jumping) {
              dribblerRef.current.jumping = true;
              dribblerRef.current.jumpVy = -9;
              sounds.playJump();
            }
          }}
          className="md:hidden py-1 px-3 bg-sky-600 text-white font-bold rounded-lg text-xs"
        >
          ▲ Saltar
        </button>
      </div>
    </div>
  );
};
