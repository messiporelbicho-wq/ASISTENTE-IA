import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LegendPlayer } from '../types/game';
import { sounds } from '../utils/audio';
import { Trophy, RotateCcw, ArrowLeft, Target, Wind, Flame, Volume2, VolumeX } from 'lucide-react';

interface FreeKickGameProps {
  player: LegendPlayer;
  onBackToMenu: () => void;
  onHighScore: (score: number) => void;
}

interface TargetRing {
  x: number;
  y: number;
  radius: number;
  points: number;
  label: string;
  hit: boolean;
}

export const FreeKickGame: React.FC<FreeKickGameProps> = ({ player, onBackToMenu, onHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [score, setScore] = useState(0);
  const [ballsRemaining, setBallsRemaining] = useState(5);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [wind, setWind] = useState(0); // -4 to +4
  const [gameOver, setGameOver] = useState(false);
  const [goalAnnouncement, setGoalAnnouncement] = useState<string | null>(null);
  const [muted, setMuted] = useState(sounds.muted);

  // Canvas dimensions
  const WIDTH = 900;
  const HEIGHT = 560;

  // Goal geometry (perspective projection)
  const GOAL_LEFT = 200;
  const GOAL_RIGHT = 700;
  const GOAL_TOP = 130;
  const GOAL_BOTTOM = 330;
  const GOAL_DEPTH = 50;

  // Ball physical state in 3D (x, y, z where z = 0 is camera/touch, z = 100 is at goal line)
  const ballRef = useRef({
    x: WIDTH / 2,
    y: HEIGHT - 80,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    spin: 0,
    radius: 22,
    inFlight: false,
    scored: false,
    stopped: false,
    trail: [] as { x: number; y: number; r: number; alpha: number }[],
  });

  // Swipe gesture tracking
  const dragRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
    startTime: number;
  }>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    startTime: 0,
  });

  // Goalkeeper state
  const gkRef = useRef({
    x: WIDTH / 2,
    y: GOAL_BOTTOM - 45,
    targetX: WIDTH / 2,
    targetY: GOAL_BOTTOM - 45,
    diveSpeed: 6.5,
    diving: false,
    diveDir: 0,
    width: 36,
    height: 70,
  });

  // Wall defenders (2 to 4 defenders depending on round)
  const wallDefendersRef = useRef<
    { x: number; y: number; jumpY: number; jumping: boolean; vy: number }[]
  >([]);

  // Target rings in goal
  const targetsRef = useRef<TargetRing[]>([
    { x: GOAL_LEFT + 45, y: GOAL_TOP + 40, radius: 28, points: 100, label: '¡ESCUADRA! 100', hit: false },
    { x: GOAL_RIGHT - 45, y: GOAL_TOP + 40, radius: 28, points: 100, label: '¡ESCUADRA! 100', hit: false },
    { x: GOAL_LEFT + 50, y: GOAL_BOTTOM - 40, radius: 26, points: 60, label: 'RASO 60', hit: false },
    { x: GOAL_RIGHT - 50, y: GOAL_BOTTOM - 40, radius: 26, points: 60, label: 'RASO 60', hit: false },
    { x: WIDTH / 2, y: GOAL_TOP + 35, radius: 25, points: 80, label: 'TRAVESAÑO 80', hit: false },
  ]);

  // Generate random wind and wall for each ball
  const setupRound = useCallback(() => {
    const newWind = Math.round((Math.random() - 0.5) * 6);
    setWind(newWind);

    // Ball reset
    const ball = ballRef.current;
    ball.x = WIDTH / 2 + (Math.random() - 0.5) * 80;
    ball.y = HEIGHT - 80;
    ball.z = 0;
    ball.vx = 0;
    ball.vy = 0;
    ball.vz = 0;
    ball.spin = 0;
    ball.inFlight = false;
    ball.scored = false;
    ball.stopped = false;
    ball.trail = [];

    // Goalkeeper reset
    gkRef.current.x = WIDTH / 2;
    gkRef.current.y = GOAL_BOTTOM - 45;
    gkRef.current.targetX = WIDTH / 2;
    gkRef.current.diving = false;
    gkRef.current.diveDir = 0;

    // Reset targets
    targetsRef.current.forEach((t) => (t.hit = false));

    // Wall setup (3 defenders positioned in front of goal at z = 45)
    const wallX = WIDTH / 2 + (Math.random() > 0.5 ? 60 : -60);
    wallDefendersRef.current = [-35, 0, 35].map((offset) => ({
      x: wallX + offset,
      y: 350,
      jumpY: 0,
      jumping: false,
      vy: 0,
    }));
  }, [WIDTH, HEIGHT, GOAL_BOTTOM]);

  useEffect(() => {
    setupRound();
  }, [setupRound]);

  // Touch & Mouse Drag Handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (ballRef.current.inFlight || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Must start near the ball
    const distToBall = Math.hypot(x - ballRef.current.x, y - ballRef.current.y);
    if (distToBall < 90) {
      dragRef.current = {
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        isDragging: true,
        startTime: Date.now(),
      };
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragRef.current.isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    dragRef.current.currentX = (clientX - rect.left) * scaleX;
    dragRef.current.currentY = (clientY - rect.top) * scaleY;
  };

  const handleEnd = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    const dx = dragRef.current.currentX - dragRef.current.startX;
    const dy = dragRef.current.currentY - dragRef.current.startY;
    const duration = Math.max(40, Date.now() - dragRef.current.startTime);

    // Only shoot if swipe is upwards
    if (dy < -20) {
      const speed = Math.min(22, (Math.hypot(dx, dy) / duration) * 35);
      const angle = Math.atan2(dy, dx);

      // Curve calculation: side swipe displacement generates aerodynamic Magnus spin
      const spinAmount = (dx / 40) * (player.power * 0.12);

      const ball = ballRef.current;
      ball.inFlight = true;
      ball.vz = 2.1; // moves from z=0 to z=100
      ball.vx = Math.cos(angle) * (speed * 0.45);
      ball.vy = Math.sin(angle) * (speed * 0.65);
      ball.spin = spinAmount;

      sounds.playKick(1.4);

      // Trigger Wall Jump
      wallDefendersRef.current.forEach((d) => {
        d.jumping = true;
        d.vy = -6.5;
      });

      // Trigger Goalkeeper Dive Prediction after short delay
      setTimeout(() => {
        // Goalkeeper predicts destination with slight imperfection based on player curve
        const predictedGoalX = ball.x + ball.vx * 35 + ball.spin * 20;
        const clampedTarget = Math.max(GOAL_LEFT + 25, Math.min(GOAL_RIGHT - 25, predictedGoalX));
        gkRef.current.targetX = clampedTarget;
        gkRef.current.diving = true;
        gkRef.current.diveDir = clampedTarget > gkRef.current.x ? 1 : -1;
      }, 180);
    }
  };

  // 60fps Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      // 1. UPDATE STATE
      const ball = ballRef.current;
      const gk = gkRef.current;

      // Update Wall jumping
      wallDefendersRef.current.forEach((d) => {
        if (d.jumping) {
          d.jumpY += d.vy;
          d.vy += 0.45;
          if (d.jumpY >= 0) {
            d.jumpY = 0;
            d.jumping = false;
          }
        }
      });

      // Update Goalkeeper dive
      if (gk.diving) {
        const dx = gk.targetX - gk.x;
        if (Math.abs(dx) > 4) {
          gk.x += Math.sign(dx) * gk.diveSpeed;
          // Dive altitude lift
          gk.y = GOAL_BOTTOM - 45 - Math.sin(Math.min(1, Math.abs(dx) / 100) * Math.PI) * 25;
        }
      }

      // Update Ball in Flight
      if (ball.inFlight && !ball.stopped) {
        ball.z += ball.vz;
        ball.x += ball.vx + wind * 0.08 + ball.spin * (ball.z / 65);
        ball.y += ball.vy;
        ball.vy += 0.28; // Gravity

        // Ball Trail
        ball.trail.push({
          x: ball.x,
          y: ball.y,
          r: Math.max(8, ball.radius * (1 - ball.z * 0.006)),
          alpha: 0.6,
        });
        if (ball.trail.length > 10) ball.trail.shift();

        // Check Wall Collision at z ≈ 45
        if (ball.z >= 40 && ball.z <= 50) {
          wallDefendersRef.current.forEach((d) => {
            const defenderHeadY = d.y + d.jumpY - 40;
            if (Math.hypot(ball.x - d.x, ball.y - defenderHeadY) < 32) {
              ball.stopped = true;
              ball.vx *= -0.3;
              ball.vy = -3;
              sounds.playKick(0.7);
              setStreak(0);
              setMultiplier(1);
              setGoalAnnouncement('¡BLOQUEADO POR LA BARRERA!');
              finishBallAttempt(false);
            }
          });
        }

        // Check Goal Arrival at z >= 90
        if (ball.z >= 90 && !ball.stopped) {
          ball.stopped = true;

          // Check Goalkeeper Save
          const gkDist = Math.hypot(ball.x - gk.x, ball.y - gk.y);
          if (gkDist < 46) {
            // Saved!
            sounds.playKick(1.0);
            setStreak(0);
            setMultiplier(1);
            setGoalAnnouncement('¡ATAJADÓN DEL PORTERO!');
            finishBallAttempt(false);
          } else if (
            ball.x >= GOAL_LEFT &&
            ball.x <= GOAL_RIGHT &&
            ball.y >= GOAL_TOP &&
            ball.y <= GOAL_BOTTOM
          ) {
            // GOAL!!
            sounds.playGoalHorn();

            // Check Target Hit bonus
            let targetBonus = 50;
            let targetLabel = '¡GOLAZO!';
            targetsRef.current.forEach((tg) => {
              if (Math.hypot(ball.x - tg.x, ball.y - tg.y) < tg.radius + 15) {
                targetBonus = tg.points;
                targetLabel = tg.label;
                tg.hit = true;
              }
            });

            const pointsEarned = targetBonus * multiplier;
            setScore((s) => s + pointsEarned);
            setStreak((st) => {
              const newSt = st + 1;
              if (newSt >= 3) setMultiplier(3);
              else if (newSt >= 2) setMultiplier(2);
              return newSt;
            });
            setGoalAnnouncement(`${targetLabel} (+${pointsEarned} PTS)`);
            finishBallAttempt(true);
          } else {
            // Missed / Out
            sounds.playCrowdCheer(0.6);
            setStreak(0);
            setMultiplier(1);
            setGoalAnnouncement('¡FUERA POR POCO!');
            finishBallAttempt(false);
          }
        }
      }

      // 2. RENDER
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Pitch Grass Perspective Background
      const grassGrad = ctx.createLinearGradient(0, 100, 0, HEIGHT);
      grassGrad.addColorStop(0, '#166534');
      grassGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 100, WIDTH, HEIGHT - 100);

      // Stadium Stands & Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 120);
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, 120);

      // Floodlights
      ctx.fillStyle = '#f8fafc';
      for (let lx = 60; lx < WIDTH; lx += 220) {
        ctx.beginPath();
        ctx.arc(lx, 25, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 18-yard box perspective lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(120, HEIGHT);
      ctx.lineTo(GOAL_LEFT - 40, GOAL_BOTTOM);
      ctx.lineTo(GOAL_RIGHT + 40, GOAL_BOTTOM);
      ctx.lineTo(WIDTH - 120, HEIGHT);
      ctx.stroke();

      // Goal Frame (3D Depth)
      // Net Back Wall
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(GOAL_LEFT + 15, GOAL_TOP + 15, GOAL_RIGHT - GOAL_LEFT - 30, GOAL_BOTTOM - GOAL_TOP - 15);

      // Net grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      for (let y = GOAL_TOP; y <= GOAL_BOTTOM; y += 16) {
        ctx.beginPath();
        ctx.moveTo(GOAL_LEFT, y);
        ctx.lineTo(GOAL_RIGHT, y);
        ctx.stroke();
      }
      for (let x = GOAL_LEFT; x <= GOAL_RIGHT; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, GOAL_TOP);
        ctx.lineTo(x, GOAL_BOTTOM);
        ctx.stroke();
      }

      // Front Goal Posts & Crossbar
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(GOAL_LEFT, GOAL_BOTTOM);
      ctx.lineTo(GOAL_LEFT, GOAL_TOP);
      ctx.lineTo(GOAL_RIGHT, GOAL_TOP);
      ctx.lineTo(GOAL_RIGHT, GOAL_BOTTOM);
      ctx.stroke();

      // Target Rings inside Goal
      targetsRef.current.forEach((t) => {
        ctx.save();
        ctx.strokeStyle = t.hit ? '#eab308' : '#38bdf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = t.hit ? 'rgba(234, 179, 8, 0.3)' : 'rgba(56, 189, 248, 0.2)';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${t.points}`, t.x, t.y + 4);
        ctx.restore();
      });

      // Goalkeeper
      ctx.save();
      ctx.translate(gk.x, gk.y);
      // Goalkeeper shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 35, 25, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // GK Jersey (Bright Neon Yellow/Green)
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.roundRect(-gk.width / 2, -gk.height / 2 + 15, gk.width, 36, 6);
      ctx.fill();

      // GK Head
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -gk.height / 2 + 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // GK Gloves
      ctx.fillStyle = '#f97316';
      const gloveSpread = gk.diving ? 30 : 22;
      ctx.beginPath();
      ctx.arc(-gloveSpread, -5, 8, 0, Math.PI * 2);
      ctx.arc(gloveSpread, -5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Wall Defenders (at z ≈ 45, rendered in front of GK)
      wallDefendersRef.current.forEach((d) => {
        ctx.save();
        ctx.translate(d.x, d.y + d.jumpY);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 15 - d.jumpY, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wall Body
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-14, -25, 28, 38, 5);
        ctx.fill();

        // Wall Head
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -35, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Ball Trail
      ball.trail.forEach((t) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Current Ball (Scales down with z-depth for 3D perspective!)
      const currentBallRadius = Math.max(9, ball.radius * (1 - ball.z * 0.0055));
      ctx.save();
      ctx.translate(ball.x, ball.y);

      // Ball shadow on ground
      if (!ball.inFlight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, currentBallRadius + 4, currentBallRadius * 1.1, currentBallRadius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ball Sphere
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, currentBallRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Ball Pentagons
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, currentBallRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Swipe Drag Aim Guide Line
      if (dragRef.current.isDragging) {
        const dx = dragRef.current.currentX - dragRef.current.startX;
        const dy = dragRef.current.currentY - dragRef.current.startY;
        if (dy < -10) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 4;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(ball.x, ball.y);
          // Projected curved guide
          const aimEndX = ball.x + dx * 1.5;
          const aimEndY = ball.y + dy * 1.5;
          ctx.quadraticCurveTo(ball.x + dx * 0.8, ball.y + dy * 0.6, aimEndX, aimEndY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [wind, multiplier, GOAL_LEFT, GOAL_RIGHT, GOAL_TOP, GOAL_BOTTOM, WIDTH, HEIGHT]);

  const finishBallAttempt = (scored: boolean) => {
    setTimeout(() => {
      setBallsRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setGameOver(true);
          onHighScore(score);
          sounds.playFanfare();
        } else {
          setupRound();
          setGoalAnnouncement(null);
        }
        return next;
      });
    }, 1800);
  };

  const handleRestart = () => {
    setScore(0);
    setBallsRemaining(5);
    setStreak(0);
    setMultiplier(1);
    setGameOver(false);
    setGoalAnnouncement(null);
    setupRound();
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full px-5 py-3 mb-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
        {/* Score & Multiplier */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">PUNTUACIÓN</div>
            <div className="text-3xl font-black text-amber-400 tabular-nums">{score}</div>
          </div>
          {multiplier > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>x{multiplier} MULTIPLICADOR</span>
            </div>
          )}
        </div>

        {/* Wind meter & Streak */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Wind className="w-4 h-4 text-sky-400" />
            <span>
              Viento: {Math.abs(wind)} km/h {wind > 0 ? '➔' : wind < 0 ? '⬅' : '●'}
            </span>
          </div>

          {/* Balls remaining indicator */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg transition-transform ${
                  i < ballsRemaining ? 'opacity-100 scale-100' : 'opacity-20 scale-75'
                }`}
              >
                ⚽
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Pitch View */}
      <div
        className="relative w-full overflow-hidden border border-slate-800 rounded-2xl shadow-2xl bg-slate-950 aspect-[16/10] cursor-crosshair touch-none"
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full h-full object-contain" />

        {/* Instruction overlay when ready to shoot */}
        {!ballRef.current.inFlight && !gameOver && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
            <div className="px-4 py-2 bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-full text-xs text-slate-300 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Arrastra desde el balón hacia arriba con curva para disparar</span>
            </div>
          </div>
        )}

        {/* Goal Announcement */}
        {goalAnnouncement && (
          <div className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none animate-goal-shake">
            <div className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-2xl tracking-wider rounded-xl shadow-2xl border-2 border-white uppercase">
              {goalAnnouncement}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="flex flex-col items-center max-w-sm w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center shadow-2xl">
              <Trophy className="w-12 h-12 text-amber-400 mb-2" />
              <h3 className="text-2xl font-black text-white">¡Fin del Desafío!</h3>
              <p className="text-slate-400 text-sm mt-1">Puntuación Final Acumulada</p>
              <div className="my-4 text-4xl font-extrabold text-amber-400 tabular-nums">{score} pts</div>

              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Intentar Otra Vez
                </button>
                <button
                  onClick={onBackToMenu}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Menú
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between w-full mt-3 px-4 py-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl">
        <span>Tirador: <strong className="text-slate-200">{player.name}</strong> ({player.nickname}) · Potencia: {player.power}/10</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(sounds.toggleMute())}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            <span>{muted ? 'Sin Sonido' : 'Sonido'}</span>
          </button>
          <button
            onClick={onBackToMenu}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    </div>
  );
};
