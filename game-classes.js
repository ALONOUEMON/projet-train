class Junction {
  constructor(x, y, id) {
    this.x = x; this.y = y; this.id = id;
    this.state = 0;
    this.connections = {};
  }
  toggle() { this.state ^= 1; }
  route(inDir) {
    const c = this.connections[inDir];
    return c ? c[this.state] : null;
  }
  draw() {
    const cx = offsetX + this.x * CELL + CELL / 2;
    const cy = offsetY + this.y * CELL + CELL / 2;
    ctx.save();
    ctx.shadowColor = '#4af'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0d1520'; ctx.fill();
    ctx.strokeStyle = '#4af'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#4af'; ctx.lineWidth = 2;
    const d = 8;
    ctx.beginPath();
    ctx.moveTo(cx-d,cy-d); ctx.lineTo(cx+d,cy+d);
    ctx.moveTo(cx+d,cy-d); ctx.lineTo(cx-d,cy+d);
    ctx.stroke();
    const dotX = this.state === 0 ? cx+9 : cx-9;
    ctx.beginPath(); ctx.arc(dotX, cy-9, 4, 0, Math.PI*2);
    ctx.fillStyle = this.state === 0 ? '#4f4' : '#fa4';
    ctx.shadowColor = this.state === 0 ? '#4f4' : '#fa4'; ctx.shadowBlur = 6;
    ctx.fill(); ctx.restore();
  }
  hitTest(px, py) {
    const cx = offsetX + this.x * CELL + CELL / 2;
    const cy = offsetY + this.y * CELL + CELL / 2;
    return Math.hypot(px - cx, py - cy) <= 24;
  }
}

class Station {
  constructor(x, y, colorIdx) {
    this.x = x; this.y = y; this.colorIdx = colorIdx;
    this.color = COLORS[colorIdx]; this.flash = 0;
  }
  draw() {
    const cx = offsetX + this.x * CELL + CELL / 2;
    const cy = offsetY + this.y * CELL + CELL / 2;
    const s = 22;
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.flash > 0 ? 25 : 8;
    ctx.fillStyle = this.color; ctx.fillRect(cx-s, cy-s, s*2, s*2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(cx-s, cy-s, s*2, s*2);
    if (this.flash > 0) this.flash--;
    ctx.restore();
  }
}

class Tunnel {
  constructor(x, y) { this.x = x; this.y = y; }
  draw() {
    const cx = offsetX + this.x * CELL + CELL / 2;
    const cy = offsetY + this.y * CELL + CELL / 2;
    const s = 24;
    ctx.save();
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
    ctx.fillRect(cx-s, cy-s, s*2, s*2); ctx.strokeRect(cx-s, cy-s, s*2, s*2);
    ctx.beginPath(); ctx.arc(cx, cy+4, 15, Math.PI, 0);
    ctx.lineTo(cx+15, cy+s); ctx.lineTo(cx-15, cy+s); ctx.closePath();
    ctx.fillStyle = '#111'; ctx.fill();
    ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
}

class Train {
  constructor(colorIdx, path) {
    this.colorIdx = colorIdx; this.color = COLORS[colorIdx];
    this.path = path; this.nodeIdx = 0; this.progress = 0;
    this.active = true; this.dead = false;
  }
  update(dt) {
    if (!this.active) return;
    const step = (cfg.speed / CELL) * (dt / 1000);
    this.progress += step;
    while (this.progress >= 1) {
      this.progress -= 1; this.nodeIdx++;
      if (this.nodeIdx >= this.path.length - 1) { this.active = false; this.progress = 0; return; }
    }
  }
  getPos() {
    const maxIdx = this.path.length - 1;
    const i = Math.min(this.nodeIdx, maxIdx);
    if (i >= maxIdx) return { x: offsetX + this.path[maxIdx].x * CELL + CELL/2, y: offsetY + this.path[maxIdx].y * CELL + CELL/2 };
    const a = this.path[i], b = this.path[i+1];
    return { x: offsetX + (a.x + (b.x - a.x) * this.progress) * CELL + CELL/2, y: offsetY + (a.y + (b.y - a.y) * this.progress) * CELL + CELL/2 };
  }
  draw() {
    if (this.dead) return;
    const pos = this.getPos(); const s = 13;
    ctx.save();
    ctx.shadowColor = this.color; ctx.shadowBlur = 14;
    ctx.fillStyle = this.color; ctx.fillRect(pos.x-s, pos.y-s, s*2, s*2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(pos.x-s, pos.y-s, s*2, s*2);
    ctx.shadowBlur = 0; ctx.fillStyle = '#000';
    for (const dx of [-s+5, s-5]) { ctx.beginPath(); ctx.arc(pos.x+dx, pos.y+s-2, 3.5, 0, Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
}