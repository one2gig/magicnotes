export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: "spark" | "symbol" | "orb";
  symbol: string;
  rotation: number;
  spin: number;
}

export interface TrailDot {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}

const MAX_PARTICLES = 120;

export class ParticleEngine {
  particles: Particle[] = [];
  trails: TrailDot[] = [];
  reduced = false;
  private slowFrames = 0;

  noteFrame(ms: number) {
    if (ms > 34) this.slowFrames = Math.min(40, this.slowFrames + 1);
    else this.slowFrames = Math.max(0, this.slowFrames - 1);
    this.reduced = this.slowFrames > 18;
  }

  burst(x: number, y: number, color: string) {
    this.push({
      x,
      y,
      vx: 0,
      vy: -0.02,
      life: 0.75,
      maxLife: 0.75,
      size: 34,
      color,
      kind: "orb",
      symbol: "",
      rotation: 0,
      spin: 0,
    });

    const count = this.reduced ? 6 : 8 + Math.floor(Math.random() * 9);
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.12;
      const life = 0.55 + Math.random() * 0.45;
      this.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.65 - 0.08,
        life,
        maxLife: life,
        size: 2.5 + Math.random() * 4,
        color,
        kind: "spark",
        symbol: "",
        rotation: 0,
        spin: 0,
      });
    }

    const symbols = this.particles.filter((particle) => particle.kind === "symbol").length;
    if (!this.reduced && symbols < 6 && Math.random() < 0.55) {
      this.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.03,
        vy: -0.08 - Math.random() * 0.05,
        life: 1.15,
        maxLife: 1.15,
        size: 22,
        color,
        kind: "symbol",
        symbol: Math.random() > 0.5 ? "♪" : "♫",
        rotation: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 1.2,
      });
    }
  }

  addTrail(x: number, y: number, color: string) {
    if (this.reduced) return;
    this.trails.push({ x, y, life: 0.32, maxLife: 0.32, color });
    if (this.trails.length > 70) this.trails.splice(0, this.trails.length - 70);
  }

  tick(dt: number) {
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
    for (const trail of this.trails) trail.life -= dt;
    this.trails = this.trails.filter((trail) => trail.life > 0);
  }

  private push(particle: Particle) {
    if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
    this.particles.push(particle);
  }
}
