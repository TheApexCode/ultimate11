export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'spark' | 'ring';
}

class ParticleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private isRunning: boolean = false;

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    if (!this.isRunning) {
      this.startLoop();
    }
  }

  public resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private startLoop() {
    this.isRunning = true;
    const loop = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
    window.removeEventListener('resize', this.resize.bind(this));
  }

  private update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.shape === 'ring') {
        p.size += 4;
      }

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.strokeStyle = p.color;
      this.ctx.lineWidth = 2;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'square') {
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'ring') {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (p.shape === 'spark') {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2);
        this.ctx.lineTo(p.x, p.y);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }
  }

  // Shockwave & Sparks at Clash Center
  public triggerClashImpact(x?: number, y?: number) {
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;

    // Expand Shockwave rings
    this.particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#06b6d4',
      alpha: 1,
      life: 0,
      maxLife: 40,
      shape: 'ring',
    });
    this.particles.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      size: 5,
      color: '#f59e0b',
      alpha: 1,
      life: 0,
      maxLife: 35,
      shape: 'ring',
    });

    // High velocity sparks
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      const colors = ['#00f0ff', '#ff00aa', '#ffea00', '#ffffff'];
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 35 + 25,
        shape: 'spark',
      });
    }
  }

  // Neon Goal Fireworks
  public triggerGoalExplosion() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2 - 50;

    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6'];

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 2;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 1, // slight gravity
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 60 + 40,
        shape: Math.random() > 0.5 ? 'circle' : 'square',
      });
    }
  }

  // Card Flip / Pack Opening Glimmer
  public triggerCardRevealSparkles(x: number, y: number, rarity: string) {
    let colorList = ['#ffffff', '#94a3b8'];
    if (rarity === 'Rare') colorList = ['#3b82f6', '#60a5fa', '#93c5fd'];
    if (rarity === 'Epic') colorList = ['#a855f7', '#c084fc', '#e9d5ff'];
    if (rarity === 'Legendary') colorList = ['#f59e0b', '#fbbf24', '#fde68a'];
    if (rarity === 'Cyber-Icon') colorList = ['#00f0ff', '#ff00aa', '#ffe600', '#ffffff'];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 1.5,
        color: colorList[Math.floor(Math.random() * colorList.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 30 + 20,
        shape: 'spark',
      });
    }
  }

  // Victory Confetti Rain
  public triggerVictoryConfetti() {
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff'];
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 120 + 80,
        shape: 'square',
      });
    }
  }
}

export const particleEngine = new ParticleEngine();
