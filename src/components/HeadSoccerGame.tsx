import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LegendPlayer, AIDifficulty, MatchStats } from '../types/game';
import { sounds } from '../utils/audio';
import { Sparkles, Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft, Zap, Users, Bot } from 'lucide-react';

interface HeadSoccerGameProps {
  player1: LegendPlayer;
  player2: LegendPlayer;
  difficulty: AIDifficulty;
  isTwoPlayer: boolean;
  onBackToMenu: () => void;
  onMatchComplete: (stats: MatchStats) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'confetti' | 'smoke';
}

export const HeadSoccerGame: React.FC<HeadSoccerGameProps> = ({
  player1,
  player2,
  difficulty,
  isTwoPlayer,
  onBackToMenu,
  onMatchComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match state
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [matchOver, setMatchOver] = useState(false);
  const [goldenGoal, setGoldenGoal] = useState(false);
  const [goalBanner, setGoalBanner] = useState<string | null>(null);
  const [p1Super, setP1Super] = useState(0); // 0 to 100
  const [p2Super, setP2Super] = useState(0); // 0 to 100
  const [muted, setMuted] = useState(sounds.muted);

  // Match statistics tracking
  const statsRef = useRef<MatchStats>({
    p1Score: 0,
    p2Score: 0,
    shotsP1: 0,
    shotsP2: 0,
    savesP1: 0,
    savesP2: 0,
    supersUsedP1: 0,
    supersUsedP2: 0,
    timeElapsed: 0,
    winner: null,
  });

  // Controls state
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchControlsRef = useRef<{
    left: boolean;
    right: boolean;
    jump: boolean;
    kick: boolean;
    super: boolean;
  }>({
    left: false,
    right: false,
    jump: false,
    kick: false,
    super: false,
  });

  // Physical constants
  const WIDTH = 960;
  const HEIGHT = 540;
  const GROUND_Y = 460;
  const GRAVITY = 0.55;

  // Goals
  const GOAL_WIDTH = 85;
  const GOAL_HEIGHT = 175;
  const GOAL_TOP = GROUND_Y - GOAL_HEIGHT;

  // Entities state
  const p1Ref = useRef({
    x: 180,
    y: GROUND_Y - 45,
    vx: 0,
    vy: 0,
    radius: 34,
    isGrounded: true,
    facing: 1, // 1 = right, -1 = left
    kickAngle: 0,
    isKicking: false,
    superActive: false,
    superTimer: 0,
    trail: [] as { x: number; y: number }[],
  });

  const p2Ref = useRef({
    x: WIDTH - 180,
    y: GROUND_Y - 45,
    vx: 0,
    vy: 0,
    radius: 34,
    isGrounded: true,
    facing: -1,
    kickAngle: 0,
    isKicking: false,
    superActive: false,
    superTimer: 0,
    trail: [] as { x: number; y: number }[],
  });

  const ballRef = useRef({
    x: WIDTH / 2,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 17,
    rotation: 0,
    spin: 0,
    isSuper: false,
    superOwner: null as 'p1' | 'p2' | null,
    superColor: '#ffffff',
    trail: [] as { x: number; y: number; color: string; size: number }[],
  });

  const particlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef(0);
  const goalCooldownRef = useRef(0);

  // Spawn confetti particles on goal
  const spawnGoalConfetti = useCallback((isP1: boolean) => {
    sounds.playGoalHorn();
    const colors = isP1
      ? [player1.superColor, '#38bdf8', '#ffffff', '#facc15']
      : [player2.superColor, '#ef4444', '#ffffff', '#facc15'];

    for (let i = 0; i < 90; i++) {
      particlesRef.current.push({
        x: isP1 ? WIDTH - GOAL_WIDTH / 2 : GOAL_WIDTH / 2,
        y: GOAL_TOP + Math.random() * GOAL_HEIGHT,
        vx: (Math.random() - 0.5) * 14 + (isP1 ? -4 : 4),
        vy: -Math.random() * 12 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        type: 'confetti',
      });
    }
    shakeRef.current = 15;
  }, [player1.superColor, player2.superColor]);

  // Reset ball and players to kick-off positions
  const resetKickoff = useCallback((scoringPlayer: 'p1' | 'p2' | null) => {
    p1Ref.current.x = 180;
    p1Ref.current.y = GROUND_Y - 45;
    p1Ref.current.vx = 0;
    p1Ref.current.vy = 0;
    p1Ref.current.superActive = false;

    p2Ref.current.x = WIDTH - 180;
    p2Ref.current.y = GROUND_Y - 45;
    p2Ref.current.vx = 0;
    p2Ref.current.vy = 0;
    p2Ref.current.superActive = false;

    ballRef.current.x = WIDTH / 2;
    ballRef.current.y = 200;
    ballRef.current.vx = scoringPlayer === 'p1' ? 1.5 : scoringPlayer === 'p2' ? -1.5 : (Math.random() > 0.5 ? 1 : -1);
    ballRef.current.vy = -3;
    ballRef.current.isSuper = false;
    ballRef.current.superOwner = null;
    ballRef.current.trail = [];
    goalCooldownRef.current = 75; // frames pause
  }, []);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Prevent page scrolling with game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Quick mute toggle with M
      if (e.code === 'KeyM') {
        const isMuted = sounds.toggleMute();
        setMuted(isMuted);
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

  // Match countdown timer
  useEffect(() => {
    if (isPaused || matchOver) return;

    sounds.playWhistle(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Check for golden goal or end match
          if (p1Score === p2Score) {
            setGoldenGoal(true);
            return 0;
          } else {
            setMatchOver(true);
            sounds.playWhistle();
            const winner = p1Score > p2Score ? 'p1' : 'p2';
            statsRef.current.winner = winner;
            statsRef.current.p1Score = p1Score;
            statsRef.current.p2Score = p2Score;
            onMatchComplete(statsRef.current);
            clearInterval(timer);
            return 0;
          }
        }
        statsRef.current.timeElapsed += 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, matchOver, p1Score, p2Score, onMatchComplete]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p1Speed = 5.2 + player1.speed * 0.28;
    const p1Jump = 12.5 + player1.jump * 0.35;
    const p2Speed = 5.2 + player2.speed * 0.28;
    const p2Jump = 12.5 + player2.jump * 0.35;

    const loop = () => {
      if (!isPaused) {
        // --- 1. HANDLE INPUTS ---
        const p1 = p1Ref.current;
        const p2 = p2Ref.current;
        const ball = ballRef.current;
        const keys = keysRef.current;
        const touch = touchControlsRef.current;

        // Player 1 controls (WASD or Touch)
        const p1Left = keys['KeyA'] || touch.left;
        const p1Right = keys['KeyD'] || touch.right;
        const p1JumpKey = keys['KeyW'] || touch.jump;
        const p1KickKey = keys['Space'] || keys['KeyJ'] || touch.kick;
        const p1SuperKey = keys['KeyK'] || touch.super;

        // P1 Horizontal Move
        if (p1Left) {
          p1.vx = -p1Speed;
          p1.facing = -1;
        } else if (p1Right) {
          p1.vx = p1Speed;
          p1.facing = 1;
        } else {
          p1.vx *= 0.75;
        }

        // P1 Jump
        if (p1JumpKey && p1.isGrounded) {
          p1.vy = -p1Jump;
          p1.isGrounded = false;
          sounds.playJump();
        }

        // P1 Kick
        if (p1KickKey && !p1.isKicking) {
          p1.isKicking = true;
          p1.kickAngle = 1;
        }
        if (p1.isKicking) {
          p1.kickAngle -= 0.15;
          if (p1.kickAngle <= 0) {
            p1.isKicking = false;
            p1.kickAngle = 0;
          }
        }

        // P1 Super Shot Activation
        if (p1SuperKey && p1Super >= 100 && !p1.superActive) {
          p1.superActive = true;
          p1.superTimer = 180; // 3 seconds aura
          setP1Super(0);
          statsRef.current.supersUsedP1 += 1;
          sounds.playSuperKick();
        }

        // --- PLAYER 2 / AI CONTROLS ---
        if (isTwoPlayer) {
          // Player 2 Manual (Arrows + Enter / L)
          const p2Left = keys['ArrowLeft'];
          const p2Right = keys['ArrowRight'];
          const p2JumpKey = keys['ArrowUp'];
          const p2KickKey = keys['Enter'] || keys['KeyL'];
          const p2SuperKey = keys['KeyO'];

          if (p2Left) {
            p2.vx = -p2Speed;
            p2.facing = -1;
          } else if (p2Right) {
            p2.vx = p2Speed;
            p2.facing = 1;
          } else {
            p2.vx *= 0.75;
          }

          if (p2JumpKey && p2.isGrounded) {
            p2.vy = -p2Jump;
            p2.isGrounded = false;
            sounds.playJump();
          }

          if (p2KickKey && !p2.isKicking) {
            p2.isKicking = true;
            p2.kickAngle = 1;
          }
          if (p2.isKicking) {
            p2.kickAngle -= 0.15;
            if (p2.kickAngle <= 0) {
              p2.isKicking = false;
              p2.kickAngle = 0;
            }
          }

          if (p2SuperKey && p2Super >= 100 && !p2.superActive) {
            p2.superActive = true;
            p2.superTimer = 180;
            setP2Super(0);
            statsRef.current.supersUsedP2 += 1;
            sounds.playSuperKick();
          }
        } else {
          // AI BOT LOGIC
          const aiSkillFactor = difficulty === 'EASY' ? 0.65 : difficulty === 'MEDIUM' ? 0.85 : 1.05;
          const targetX = Math.min(WIDTH - 120, Math.max(WIDTH / 2 + 30, ball.x + 35));

          // AI Movement towards target
          const dx = targetX - p2.x;
          if (Math.abs(dx) > 12) {
            p2.vx = Math.sign(dx) * (p2Speed * aiSkillFactor);
            p2.facing = p2.vx > 0 ? 1 : -1;
          } else {
            p2.vx *= 0.6;
          }

          // AI Jump decision
          const distToBall = Math.hypot(ball.x - p2.x, ball.y - p2.y);
          if (p2.isGrounded && distToBall < 110 && ball.y < p2.y - 15) {
            if (Math.random() < (difficulty === 'EASY' ? 0.4 : 0.85)) {
              p2.vy = -p2Jump * (0.85 + Math.random() * 0.2);
              p2.isGrounded = false;
              sounds.playJump();
            }
          }

          // AI Kick decision
          if (distToBall < 65 && !p2.isKicking && ball.x < p2.x + 20) {
            p2.isKicking = true;
            p2.kickAngle = 1;
          }
          if (p2.isKicking) {
            p2.kickAngle -= 0.15;
            if (p2.kickAngle <= 0) {
              p2.isKicking = false;
              p2.kickAngle = 0;
            }
          }

          // AI Super Activation
          if (p2Super >= 100 && distToBall < 140 && ball.x > WIDTH / 2 && !p2.superActive) {
            p2.superActive = true;
            p2.superTimer = 180;
            setP2Super(0);
            statsRef.current.supersUsedP2 += 1;
            sounds.playSuperKick();
          }
        }

        // Apply Player Physics
        [p1, p2].forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += GRAVITY;

          // Ground collision
          if (p.y >= GROUND_Y - 45) {
            p.y = GROUND_Y - 45;
            p.vy = 0;
            p.isGrounded = true;
          }

          // Horizontal bounds (behind goal post or edge)
          const minX = GOAL_WIDTH - 20;
          const maxX = WIDTH - GOAL_WIDTH + 20;
          if (p.x < minX) p.x = minX;
          if (p.x > maxX) p.x = maxX;

          // Super timer decay
          if (p.superActive) {
            p.superTimer -= 1;
            if (p.superTimer <= 0) p.superActive = false;
            // Spawn super aura particles
            if (Math.random() < 0.35) {
              particlesRef.current.push({
                x: p.x + (Math.random() - 0.5) * 40,
                y: p.y + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                color: idx === 0 ? player1.superColor : player2.superColor,
                size: Math.random() * 5 + 2,
                alpha: 0.8,
                life: 0,
                maxLife: 25,
                type: 'spark',
              });
            }
          }
        });

        // Player to Player Collision (soft push)
        const pDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const minPdist = p1.radius + p2.radius;
        if (pDist < minPdist && pDist > 0) {
          const overlap = (minPdist - pDist) / 2;
          const nx = (p2.x - p1.x) / pDist;
          p1.x -= nx * overlap;
          p2.x += nx * overlap;
        }

        // --- 2. BALL PHYSICS & COLLISIONS ---
        if (goalCooldownRef.current > 0) {
          goalCooldownRef.current -= 1;
        } else {
          // Ball movement
          ball.x += ball.vx;
          ball.y += ball.vy;
          ball.vy += GRAVITY * 0.82;
          ball.vx *= 0.995; // Air drag
          ball.rotation += ball.vx * 0.05;

          // Ball Super Trail
          if (ball.isSuper) {
            ball.trail.push({ x: ball.x, y: ball.y, color: ball.superColor, size: ball.radius });
            if (ball.trail.length > 12) ball.trail.shift();
          } else if (ball.trail.length > 0) {
            ball.trail.shift();
          }

          // Ceiling bounce
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.8;
          }

          // Ground bounce
          if (ball.y + ball.radius >= GROUND_Y) {
            ball.y = GROUND_Y - ball.radius;
            ball.vy = -ball.vy * 0.74; // Restitution
            ball.vx *= 0.88; // Ground friction
            if (Math.abs(ball.vy) > 2) {
              sounds.playKick(0.3);
            }
          }

          // Goal Crossbar Collisions
          // Left Crossbar (x: GOAL_WIDTH, y: GOAL_TOP)
          const distLeftBar = Math.hypot(ball.x - GOAL_WIDTH, ball.y - GOAL_TOP);
          if (distLeftBar < ball.radius + 6) {
            ball.vx = Math.abs(ball.vx) * 0.8 + 2;
            ball.vy = -Math.abs(ball.vy) * 0.8;
            sounds.playCrossbar();
            shakeRef.current = 6; 
          }

          // Right Crossbar (x: WIDTH - GOAL_WIDTH, y: GOAL_TOP)
          const distRightBar = Math.hypot(ball.x - (WIDTH - GOAL_WIDTH), ball.y - GOAL_TOP);
          if (distRightBar < ball.radius + 6) {
            ball.vx = -Math.abs(ball.vx) * 0.8 - 2;
            ball.vy = -Math.abs(ball.vy) * 0.8;
            sounds.playCrossbar();
            shakeRef.current = 6;
          }

          // Pitch Back Boundaries (behind goal inside net)
          if (ball.x - ball.radius < 10) {
            ball.x = 10 + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.5;
          }
          if (ball.x + ball.radius > WIDTH - 10) {
            ball.x = WIDTH - 10 - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.5;
          }

          // --- PLAYER TO BALL COLLISION ---
          const checkPlayerBallCollision = (p: typeof p1, isP1: boolean) => {
            const headX = p.x;
            const headY = p.y - 12;
            const headRadius = p.radius;
            const d = Math.hypot(ball.x - headX, ball.y - headY);

            if (d < ball.radius + headRadius) {
              // Collision normal
              const nx = (ball.x - headX) / (d || 1);
              const ny = (ball.y - headY) / (d || 1);

              // Position resolve
              ball.x = headX + nx * (ball.radius + headRadius + 1);
              ball.y = headY + ny * (ball.radius + headRadius + 1);

              // Power calculation
              let kickMult = 1.0;
              if (p.isKicking) {
                kickMult = 1.65;
                if (isP1) statsRef.current.shotsP1 += 1;
                else statsRef.current.shotsP2 += 1;
              }

              // Check if player activated super
              if (p.superActive) {
                ball.isSuper = true;
                ball.superOwner = isP1 ? 'p1' : 'p2';
                ball.superColor = isP1 ? player1.superColor : player2.superColor;
                kickMult = 2.4;
                p.superActive = false; // discharged into the shot
                sounds.playSuperKick();
              } else {
                sounds.playKick(kickMult);
              }

              // Header or kick impulse
              const forwardImpulse = (isP1 ? 1 : -1) * (6 + (isP1 ? player1.power : player2.power) * 0.45);
              const upImpulse = -5.5 - Math.abs(p.vy) * 0.5;

              ball.vx = (nx * 8 + forwardImpulse) * kickMult;
              ball.vy = (ny * 6 + upImpulse) * (p.isKicking ? 0.9 : 1.1);

              // Add super meter charge on touch
              if (isP1) {
                setP1Super((s) => Math.min(100, s + (p.isKicking ? 18 : 8)));
              } else {
                setP2Super((s) => Math.min(100, s + (p.isKicking ? 18 : 8)));
              }

              // Add hit spark particles
              for (let i = 0; i < 6; i++) {
                particlesRef.current.push({
                  x: ball.x,
                  y: ball.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#ffffff',
                  size: 3,
                  alpha: 0.9,
                  life: 0,
                  maxLife: 15,
                  type: 'spark',
                });
              }
            }
          };

          checkPlayerBallCollision(p1, true);
          checkPlayerBallCollision(p2, false);

          // --- 3. GOAL DETECTION ---
          // Goal P1 (Ball in Right Net: x > WIDTH - GOAL_WIDTH and y > GOAL_TOP)
          if (ball.x > WIDTH - GOAL_WIDTH + 15 && ball.y > GOAL_TOP + 10 && ball.y < GROUND_Y) {
            setP1Score((s) => {
              const newScore = s + 1;
              statsRef.current.p1Score = newScore;
              return newScore;
            });
            spawnGoalConfetti(true);
            setGoalBanner(`¡¡GOLAZO DE ${player1.nickname.toUpperCase()}!!`);
            setTimeout(() => setGoalBanner(null), 2500);

            if (goldenGoal) {
              setMatchOver(true);
              statsRef.current.winner = 'p1';
              onMatchComplete(statsRef.current);
            } else {
              resetKickoff('p1');
            }
          }

          // Goal P2 (Ball in Left Net: x < GOAL_WIDTH and y > GOAL_TOP)
          if (ball.x < GOAL_WIDTH - 15 && ball.y > GOAL_TOP + 10 && ball.y < GROUND_Y) {
            setP2Score((s) => {
              const newScore = s + 1;
              statsRef.current.p2Score = newScore;
              return newScore;
            });
            spawnGoalConfetti(false);
            setGoalBanner(`¡¡GOLAZO DE ${player2.nickname.toUpperCase()}!!`);
            setTimeout(() => setGoalBanner(null), 2500);

            if (goldenGoal) {
              setMatchOver(true);
              statsRef.current.winner = 'p2';
              onMatchComplete(statsRef.current);
            } else {
              resetKickoff('p2');
            }
          }
        }

        // Particle updates
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.2;
          pt.life += 1;
          pt.alpha = 1 - pt.life / pt.maxLife;
          if (pt.life >= pt.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // Camera shake dampening
        if (shakeRef.current > 0) {
          shakeRef.current *= 0.88;
          if (shakeRef.current < 0.2) shakeRef.current = 0;
        }
      }

      // --- 4. RENDER CANVAS ---
      ctx.save();
      if (shakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * shakeRef.current * 2;
        const sy = (Math.random() - 0.5) * shakeRef.current * 2;
        ctx.translate(sx, sy);
      }

      // A. Sky & Stadium Lights Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#060b19');
      skyGrad.addColorStop(0.5, '#0c1a30');
      skyGrad.addColorStop(1, '#132845');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, GROUND_Y);

      // Stadium floodlight beams
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#60a5fa';
      // Left floodlight beam
      ctx.beginPath();
      ctx.moveTo(120, 0);
      ctx.lineTo(-40, GROUND_Y);
      ctx.lineTo(400, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      // Right floodlight beam
      ctx.beginPath();
      ctx.moveTo(WIDTH - 120, 0);
      ctx.lineTo(WIDTH - 400, GROUND_Y);
      ctx.lineTo(WIDTH + 40, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Stadium Crowd Stands Silhouette with animated fan heads
      ctx.fillStyle = '#0b1322';
      ctx.fillRect(0, 180, WIDTH, 160);
      ctx.fillStyle = '#111e33';
      for (let i = 0; i < WIDTH; i += 18) {
        const bob = Math.sin((Date.now() / 300) + i) * 3;
        ctx.beginPath();
        ctx.arc(i + 9, 210 + bob, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // LED Advertising Board
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 310, WIDTH, 45);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      const ledOffset = (Date.now() / 25) % 600;
      for (let x = -600; x < WIDTH + 600; x += 320) {
        ctx.fillText('⚽ GOLAZO ARCADE · DUELO DE LEYENDAS · SIUUU & ANKARA', x - ledOffset, 338);
      }

      // Pitch Grass Strips
      const grassGrad = ctx.createLinearGradient(0, GROUND_Y - 110, 0, HEIGHT);
      grassGrad.addColorStop(0, '#15803d');
      grassGrad.addColorStop(1, '#166534');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, GROUND_Y - 110, WIDTH, HEIGHT - (GROUND_Y - 110));

      // Alternating pitch cut stripes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let x = 0; x < WIDTH; x += 80) {
        ctx.fillRect(x, GROUND_Y - 110, 40, HEIGHT);
      }

      // Pitch Lines (Center Line & Center Circle)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      // Ground baseline
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(WIDTH, GROUND_Y);
      ctx.stroke();

      // Center line
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, GROUND_Y - 110);
      ctx.lineTo(WIDTH / 2, GROUND_Y);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.ellipse(WIDTH / 2, GROUND_Y - 50, 65, 30, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Left Goal Net
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = GOAL_TOP; y <= GROUND_Y; y += 14) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GOAL_WIDTH, y);
        ctx.stroke();
      }
      for (let x = 0; x <= GOAL_WIDTH; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, GOAL_TOP);
        ctx.lineTo(x, GROUND_Y);
        ctx.stroke();
      }

      // Left Goal Post (White bar)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, GOAL_TOP);
      ctx.lineTo(GOAL_WIDTH, GOAL_TOP);
      ctx.lineTo(GOAL_WIDTH, GROUND_Y);
      ctx.stroke();

      // Right Goal Net
      for (let y = GOAL_TOP; y <= GROUND_Y; y += 14) {
        ctx.beginPath();
        ctx.moveTo(WIDTH - GOAL_WIDTH, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
      for (let x = WIDTH - GOAL_WIDTH; x <= WIDTH; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, GOAL_TOP);
        ctx.lineTo(x, GROUND_Y);
        ctx.stroke();
      }

      // Right Goal Post
      ctx.beginPath();
      ctx.moveTo(WIDTH, GOAL_TOP);
      ctx.lineTo(WIDTH - GOAL_WIDTH, GOAL_TOP);
      ctx.lineTo(WIDTH - GOAL_WIDTH, GROUND_Y);
      ctx.stroke();

      // Draw Ball Trail
      const ball = ballRef.current;
      ball.trail.forEach((t, i) => {
        ctx.fillStyle = t.color;
        ctx.globalAlpha = (i / ball.trail.length) * 0.6;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * (i / ball.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Players (Cabezones style!)
      const renderPlayer = (p: typeof p1Ref.current, legend: LegendPlayer, isP1: boolean) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Super aura glow
        if (p.superActive) {
          ctx.shadowColor = legend.superColor;
          ctx.shadowBlur = 24;
          ctx.strokeStyle = legend.superColor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, -14, p.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Shadow on ground
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, GROUND_Y - p.y - 6, 26, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Player Body (Jersey)
        ctx.fillStyle = legend.shirtColor;
        ctx.beginPath();
        ctx.ellipse(0, 10, 16, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Jersey Number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(legend.number), 0, 14);

        // 2. Kicking Shoe / Boot
        ctx.save();
        const shoeX = p.facing * (p.isKicking ? 24 : 12);
        const shoeY = 28 + (p.isKicking ? -8 : 0);
        ctx.translate(shoeX, shoeY);
        ctx.rotate(p.facing * (p.isKicking ? p.kickAngle * 1.5 : 0));
        ctx.fillStyle = legend.superColor;
        ctx.beginPath();
        ctx.roundRect(-10, -5, 20, 10, 4);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // 3. BIG HEAD (The signature Cabezón)
        ctx.save();
        ctx.translate(0, -14);

        // Head skin base
        ctx.fillStyle = legend.skinColor;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hair
        ctx.fillStyle = legend.hairColor;
        ctx.beginPath();
        ctx.arc(0, -6, p.radius + 1, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eye tracking the ball
        const eyeOffset = p.facing * 12;
        const dxBall = ball.x - (p.x + eyeOffset);
        const dyBall = ball.y - (p.y - 14);
        const eyeAngle = Math.atan2(dyBall, dxBall);
        const pupilDist = 3;

        // Sclera (White eye)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeOffset, -2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pupil tracking
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(
          eyeOffset + Math.cos(eyeAngle) * pupilDist,
          -2 + Math.sin(eyeAngle) * pupilDist,
          3.5,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Determined Eyebrow
        ctx.strokeStyle = legend.hairColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(eyeOffset - 7, -9);
        ctx.lineTo(eyeOffset + 7, -8);
        ctx.stroke();

        // Mouth (Smile or determined scream if kicking)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (p.isKicking) {
          ctx.arc(eyeOffset, 12, 5, 0, Math.PI);
        } else {
          ctx.arc(eyeOffset, 10, 6, 0.1 * Math.PI, 0.9 * Math.PI);
        }
        ctx.stroke();

        ctx.restore(); // restore head

        // Player Name Tag & Flag
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect(-42, -58, 84, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${legend.flag} ${legend.nickname}`, 0, -45);

        ctx.restore();
      };

      renderPlayer(p1Ref.current, player1, true);
      renderPlayer(p2Ref.current, player2, false);

      // Draw Ball
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.rotation);

      if (ball.isSuper) {
        ctx.shadowColor = ball.superColor;
        ctx.shadowBlur = 20;
      }

      // Ball White Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ball Pentagons / Classic Soccer Pattern
      ctx.fillStyle = ball.isSuper ? ball.superColor : '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Outer spots
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (ball.radius * 0.72), Math.sin(a) * (ball.radius * 0.72), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Render Particles
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        if (pt.type === 'confetti') {
          ctx.fillRect(pt.x, pt.y, pt.size, pt.size * 0.7);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      ctx.restore(); // restore shake

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    isPaused,
    player1,
    player2,
    difficulty,
    isTwoPlayer,
    goldenGoal,
    p1Super,
    p2Super,
    onMatchComplete,
    resetKickoff,
    spawnGoalConfetti,
  ]);

  const handleRematch = () => {
    setP1Score(0);
    setP2Score(0);
    setTimeLeft(60);
    setMatchOver(false);
    setGoldenGoal(false);
    setP1Super(0);
    setP2Super(0);
    statsRef.current = {
      p1Score: 0,
      p2Score: 0,
      shotsP1: 0,
      shotsP2: 0,
      savesP1: 0,
      savesP2: 0,
      supersUsedP1: 0,
      supersUsedP2: 0,
      timeElapsed: 0,
      winner: null,
    };
    resetKickoff(null);
    sounds.playWhistle(true);
  };

  const handleToggleMute = () => {
    const isM = sounds.toggleMute();
    setMuted(isM);
  };

  return (
    <div className="relative flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3 mb-2 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl shadow-lg">
        {/* P1 Profile & Score */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 overflow-hidden rounded-lg bg-slate-800 border border-sky-500/40">
            <img
              src={player1.avatarImg}
              alt={player1.name}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-sm tracking-wide">{player1.nickname}</span>
              <span className="text-xs">{player1.flag}</span>
            </div>
            {/* Super Meter P1 */}
            <div className="w-28 h-2.5 mt-1 bg-slate-800 rounded-sm overflow-hidden border border-slate-700">
              <div
                className="h-full transition-all duration-150"
                style={{
                  width: `${p1Super}%`,
                  backgroundColor: p1Super >= 100 ? '#f59e0b' : player1.superColor,
                }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              SUPER: {p1Super >= 100 ? '¡LISTO (ESPACIO/K)!' : `${Math.floor(p1Super)}%`}
            </div>
          </div>
        </div>

        {/* Center Scoreboard & Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 px-6 py-1 bg-slate-950/80 border border-slate-700/60 rounded-lg">
            <span className="text-3xl font-black text-sky-400 tabular-nums">{p1Score}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">VS</span>
            <span className="text-3xl font-black text-rose-400 tabular-nums">{p2Score}</span>
          </div>
          <div className="mt-1 text-xs font-mono font-medium tracking-wider text-amber-400 flex items-center gap-1">
            {goldenGoal ? (
              <span className="text-rose-500 animate-pulse font-bold">¡GOL DE ORO!</span>
            ) : (
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            )}
          </div>
        </div>

        {/* P2 Profile & Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs">{player2.flag}</span>
              <span className="font-bold text-slate-100 text-sm tracking-wide">{player2.nickname}</span>
            </div>
            {/* Super Meter P2 */}
            <div className="w-28 h-2.5 mt-1 ml-auto bg-slate-800 rounded-sm overflow-hidden border border-slate-700">
              <div
                className="h-full transition-all duration-150"
                style={{
                  width: `${p2Super}%`,
                  backgroundColor: p2Super >= 100 ? '#f59e0b' : player2.superColor,
                }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              SUPER: {p2Super >= 100 ? '¡LISTO!' : `${Math.floor(p2Super)}%`}
            </div>
          </div>
          <div className="relative w-12 h-12 overflow-hidden rounded-lg bg-slate-800 border border-rose-500/40">
            <img
              src={player2.avatarImg}
              alt={player2.name}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Main Canvas Arena */}
      <div className="relative w-full overflow-hidden border border-slate-800 rounded-2xl shadow-2xl bg-slate-950 aspect-[16/9] max-h-[600px]">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* Goal Banner Toast Overlay */}
        {goalBanner && (
          <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none animate-goal-shake">
            <div className="px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-2xl md:text-4xl tracking-wider rounded-xl shadow-2xl border-2 border-white uppercase transform rotate-[-2deg]">
              {goalBanner}
            </div>
          </div>
        )}

        {/* Victory / Match Over Modal */}
        {matchOver && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="flex flex-col items-center max-w-md w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-400 mb-3 border border-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-wide">
                {p1Score > p2Score
                  ? `¡${player1.nickname} Campeón!`
                  : p2Score > p1Score
                  ? `¡${player2.nickname} Triunfó!`
                  : '¡Empate Histórico!'}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Marcador Final: {p1Score} - {p2Score}
              </p>

              {/* Match Stats Table */}
              <div className="grid grid-cols-2 gap-2 w-full my-5 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <div className="text-left text-slate-400">
                  <span>Tiros de {player1.nickname}: </span>
                  <strong className="text-white tabular-nums">{statsRef.current.shotsP1}</strong>
                </div>
                <div className="text-right text-slate-400">
                  <span>Tiros de {player2.nickname}: </span>
                  <strong className="text-white tabular-nums">{statsRef.current.shotsP2}</strong>
                </div>
                <div className="text-left text-slate-400">
                  <span>Supers {player1.nickname}: </span>
                  <strong className="text-amber-400 tabular-nums">{statsRef.current.supersUsedP1}</strong>
                </div>
                <div className="text-right text-slate-400">
                  <span>Supers {player2.nickname}: </span>
                  <strong className="text-amber-400 tabular-nums">{statsRef.current.supersUsedP2}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleRematch}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revancha
                </button>
                <button
                  onClick={onBackToMenu}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Menú Principal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Instruction Bar & Quick Options */}
      <div className="flex flex-wrap items-center justify-between w-full mt-3 px-3 py-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-slate-200">P1:</strong> A/D Mover · W Saltar · ESPACIO Patear · K Super
          </span>
          {isTwoPlayer && (
            <span>
              <strong className="text-slate-200">P2:</strong> ← / → Mover · ↑ Saltar · ENTER Patear · O Super
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            <span>{muted ? 'Sin Sonido' : 'Sonido'}</span>
          </button>
          <button
            onClick={onBackToMenu}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Virtual Touch Controller (Visible on touch/mobile screens) */}
      <div className="grid grid-cols-2 gap-4 w-full mt-3 md:hidden">
        {/* Left directional buttons */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (touchControlsRef.current.left = true)}
            onPointerUp={() => (touchControlsRef.current.left = false)}
            onPointerLeave={() => (touchControlsRef.current.left = false)}
            className="flex-1 py-4 bg-slate-800/90 active:bg-sky-600 text-white font-bold rounded-xl border border-slate-700 active:scale-95"
          >
            ◀ Izq
          </button>
          <button
            onPointerDown={() => (touchControlsRef.current.right = true)}
            onPointerUp={() => (touchControlsRef.current.right = false)}
            onPointerLeave={() => (touchControlsRef.current.right = false)}
            className="flex-1 py-4 bg-slate-800/90 active:bg-sky-600 text-white font-bold rounded-xl border border-slate-700 active:scale-95"
          >
            Der ▶
          </button>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (touchControlsRef.current.jump = true)}
            onPointerUp={() => (touchControlsRef.current.jump = false)}
            onPointerLeave={() => (touchControlsRef.current.jump = false)}
            className="flex-1 py-4 bg-slate-800/90 active:bg-amber-600 text-white font-bold rounded-xl border border-slate-700 active:scale-95"
          >
            ▲ Salto
          </button>
          <button
            onPointerDown={() => (touchControlsRef.current.kick = true)}
            onPointerUp={() => (touchControlsRef.current.kick = false)}
            onPointerLeave={() => (touchControlsRef.current.kick = false)}
            className="flex-1 py-4 bg-emerald-600 active:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg active:scale-95"
          >
            ⚽ Patear
          </button>
          {p1Super >= 100 && (
            <button
              onPointerDown={() => (touchControlsRef.current.super = true)}
              onPointerUp={() => (touchControlsRef.current.super = false)}
              onPointerLeave={() => (touchControlsRef.current.super = false)}
              className="py-4 px-3 bg-amber-500 active:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg animate-pulse"
            >
              ⚡ SUPER
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
