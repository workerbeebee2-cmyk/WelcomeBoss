import { useEffect, useRef } from 'react';

interface Target {
  dotX: number;
  dotY: number;
  dotVx: number;
  dotVy: number;
  trackX: number;
  trackY: number;
  id: string;
  size: number;
  type: string;
  life: number;
  maxLife: number;
  active: boolean;
  isPrimary: boolean;
}

export default function SatelliteBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    // Use refs outside the loop for stable values to avoid flickering
    let currentChk = Math.random().toString(16).substring(2, 8).toUpperCase();
    let currentKey = Math.random().toString(16).substring(2, 16).toUpperCase();
    
    let targets: Target[] = [];

    const createTarget = (index: number): Target => {
      const active = Math.random() > 0.3; // some start active
      return {
        dotX: canvas.width * (0.2 + Math.random() * 0.6),
        dotY: canvas.height * (0.2 + Math.random() * 0.6),
        dotVx: (Math.random() - 0.5) * 0.5,
        dotVy: (Math.random() - 0.5) * 0.5,
        trackX: canvas.width / 2, // starts from center
        trackY: canvas.height / 2,
        id: `TGT-${Math.floor(Math.random() * 9000) + 1000}`,
        size: index === 0 ? 24 : 16 + Math.random() * 10,
        type: ['OBJ-MTR', 'UNK-HVT', 'VEH-GND', 'UAV-X'][Math.floor(Math.random()*4)],
        life: 0,
        maxLife: 200 + Math.random() * 300,
        active: active,
        isPrimary: index === 0
      };
    };

    const initializeTargets = () => {
      targets = Array(5).fill(0).map((_, i) => createTarget(i));
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeTargets();
    };

    // Static noise pattern
    const generateNoise = () => {
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 256;
      noiseCanvas.height = 256;
      const noiseCtx = noiseCanvas.getContext('2d');
      if(noiseCtx) {
        const idata = noiseCtx.createImageData(256, 256);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;
        for (let i = 0; i < len; i++) {
          buffer32[i] = Math.random() < 0.05 ? 0xffffffff : 0xff000000;
        }
        noiseCtx.putImageData(idata, 0, 0);
      }
      return noiseCanvas;
    };
    
    const noisePat = generateNoise();

    const drawFeed = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw noise overlay, slowly shifting
      ctx.save();
      ctx.globalAlpha = 0.02;
      ctx.drawImage(noisePat, (time * 10) % 256, (time * 10) % 256, canvas.width, canvas.height);
      ctx.restore();

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Big outer framing
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(50, 50, canvas.width - 100, canvas.height - 100);
      ctx.stroke();

      // Corner crosshairs (frame limits)
      const cr = 20;
      ctx.beginPath();
      ctx.moveTo(50, 50 - cr); ctx.lineTo(50, 50); ctx.lineTo(50 - cr, 50);
      ctx.moveTo(canvas.width - 50, 50 - cr); ctx.lineTo(canvas.width - 50, 50); ctx.lineTo(canvas.width - 50 + cr, 50);
      ctx.moveTo(50, canvas.height - 50 + cr); ctx.lineTo(50, canvas.height - 50); ctx.lineTo(50 - cr, canvas.height - 50);
      ctx.moveTo(canvas.width - 50, canvas.height - 50 + cr); ctx.lineTo(canvas.width - 50, canvas.height - 50); ctx.lineTo(canvas.width - 50 + cr, canvas.height - 50);
      ctx.stroke();

      // Center crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy); ctx.lineTo(cx - 30, cy);
      ctx.moveTo(cx + 30, cy); ctx.lineTo(cx + 150, cy);
      ctx.moveTo(cx, cy - 150); ctx.lineTo(cx, cy - 30);
      ctx.moveTo(cx, cy + 30); ctx.lineTo(cx, cy + 150);
      ctx.stroke();
      
      // Center bracket tracking
      ctx.strokeStyle = 'rgba(242, 103, 34, 0.3)'; // intel-orange
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.stroke();
        
      ctx.beginPath();
      // small inner cross pattern
      ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5);
      ctx.stroke();

      // Target Processing
      targets.forEach((target, i) => {
        if (!target.active) {
            if (Math.random() < 0.01) { // 1% chance per frame to respawn
                Object.assign(target, createTarget(i));
                target.trackX = target.dotX + (Math.random() - 0.5) * 100; // start track slightly off
                target.trackY = target.dotY + (Math.random() - 0.5) * 100;
                target.active = true;
            }
            return; // skip drawing
        }

        target.life++;
        if (target.life > target.maxLife) {
            target.active = false;
        }

        // Move dot
        target.dotX += target.dotVx;
        target.dotY += target.dotVy;

        // Bounce
        if (target.dotX < 100 || target.dotX > canvas.width - 100) target.dotVx *= -1;
        if (target.dotY < 100 || target.dotY > canvas.height - 100) target.dotVy *= -1;

        // Move tracker (chasing)
        // Add some noise to tracker to make it look like a mechanical lock
        target.trackX += (target.dotX - target.trackX) * 0.05 + (Math.random() - 0.5) * 0.5;
        target.trackY += (target.dotY - target.trackY) * 0.05 + (Math.random() - 0.5) * 0.5;

        // Draw Dot
        // Orange appearing/vanishing via opacity based on life
        let opacity = 1;
        if (target.life < 20) opacity = target.life / 20;
        else if (target.life > target.maxLife - 20) opacity = (target.maxLife - target.life) / 20;

        ctx.fillStyle = `rgba(242, 103, 34, ${opacity})`;
        ctx.beginPath();
        ctx.arc(target.dotX, target.dotY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw Square Targeting bracket around trackX, trackY
        const ts = target.size;
        const color = target.isPrimary ? `rgba(242, 103, 34, ${opacity * 0.8})` : `rgba(255, 255, 255, ${opacity * 0.4})`; 
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        // Top left
        ctx.moveTo(target.trackX - ts, target.trackY - ts + 8);
        ctx.lineTo(target.trackX - ts, target.trackY - ts);
        ctx.lineTo(target.trackX - ts + 8, target.trackY - ts);
        // Top right
        ctx.moveTo(target.trackX + ts - 8, target.trackY - ts);
        ctx.lineTo(target.trackX + ts, target.trackY - ts);
        ctx.lineTo(target.trackX + ts, target.trackY - ts + 8);
        // Bottom right
        ctx.moveTo(target.trackX + ts, target.trackY + ts - 8);
        ctx.lineTo(target.trackX + ts, target.trackY + ts);
        ctx.lineTo(target.trackX + ts - 8, target.trackY + ts);
        // Bottom left
        ctx.moveTo(target.trackX - ts + 8, target.trackY + ts);
        ctx.lineTo(target.trackX - ts, target.trackY + ts);
        ctx.lineTo(target.trackX - ts, target.trackY + ts - 8);
        ctx.stroke();
        
        // Target crosshair
        if (target.isPrimary) {
            ctx.beginPath();
            ctx.moveTo(target.trackX - ts * 2, target.trackY); ctx.lineTo(target.trackX - ts - 5, target.trackY);
            ctx.moveTo(target.trackX + ts + 5, target.trackY); ctx.lineTo(target.trackX + ts * 2, target.trackY);
            ctx.moveTo(target.trackX, target.trackY - ts * 2); ctx.lineTo(target.trackX, target.trackY - ts - 5);
            ctx.moveTo(target.trackX, target.trackY + ts + 5); ctx.lineTo(target.trackX, target.trackY + ts * 2);
            ctx.stroke();
            
            // Connect prime target to center
            ctx.strokeStyle = `rgba(242, 103, 34, ${opacity * 0.15})`;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(target.trackX, target.trackY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Target Data Box
        ctx.fillStyle = color;
        ctx.font = '9px "JetBrains Mono"';
        ctx.fillText(`${target.id}`, target.trackX + ts + 8, target.trackY - ts);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        ctx.fillText(`TYP: ${target.type}`, target.trackX + ts + 8, target.trackY - ts + 12);
        ctx.fillText(`VEL: ${(Math.abs(target.dotVx) + Math.abs(target.dotVy)).toFixed(2)}`, target.trackX + ts + 8, target.trackY - ts + 24);
      });

      // Flashing REC text
      ctx.fillStyle = (Math.floor(time * 2) % 2 === 0) ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(80, 80, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px "JetBrains Mono"';
      ctx.fillText('REC', 90, 84);

      // System telemetry top right
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`SAT-LINK: SECURE`, canvas.width - 70, 80);
      ctx.fillText(`LAT: ${47.6062 + Math.sin(time*0.01) * 0.001}`, canvas.width - 70, 95);
      ctx.fillText(`LON: ${-122.3321 + Math.cos(time*0.01) * 0.001}`, canvas.width - 70, 110);
      ctx.fillText(`FOV: 42.5°`, canvas.width - 70, 125);
      ctx.textAlign = 'left';

      // Drone data moving
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText(`ALT: ${Math.floor(2048 + Math.sin(time) * 100)}m`, cx + 45, cy + 45);
      ctx.fillText(`SPD: ${Math.floor(320 + Math.cos(time*0.5) * 20)}kph`, cx + 45, cy + 60);
      ctx.fillText(`YAW: ${(Math.sin(time*0.2) * 5).toFixed(2)}`, cx + 45, cy + 75);
      
      // Random Hex Strings on the left - Stable drawing, changing values
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      if (Math.floor(time * 10) % 5 === 0) {
         currentChk = Math.random().toString(16).substring(2, 8).toUpperCase();
         currentKey = Math.random().toString(16).substring(2, 16).toUpperCase();
      }
      ctx.fillText(`CHK: ${currentChk}`, 70, canvas.height - 90);
      ctx.fillText(`KEY: ${currentKey}`, 70, canvas.height - 75);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillText(`SYS.STATUS: OPERATIONAL`, 70, canvas.height - 105);

      // Pitch Ladder (Artificial Horizon effect)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      const pitchOffset = Math.sin(time * 0.5) * 20;
      for (let i = -3; i <= 3; i++) {
        const py = cy + i * 30 + pitchOffset;
        if (i !== 0) {
          ctx.beginPath();
          const w = i % 2 === 0 ? 40 : 20;
          // Left side
          ctx.moveTo(cx - 100 - w, py); ctx.lineTo(cx - 100, py);
          if (i > 0) { ctx.lineTo(cx - 100, py + 5); } else { ctx.lineTo(cx - 100, py - 5); }
          // Right side
          ctx.moveTo(cx + 100 + w, py); ctx.lineTo(cx + 100, py);
          if (i > 0) { ctx.lineTo(cx + 100, py + 5); } else { ctx.lineTo(cx + 100, py - 5); }
          ctx.stroke();
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillText(`${Math.abs(i * 10)}`, cx - 100 - w - 20, py + 3);
          ctx.fillText(`${Math.abs(i * 10)}`, cx + 100 + w + 5, py + 3);
        }
      }

      // Horizontal scanline
      const scanY = (time * 60) % canvas.height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
      ctx.fillRect(0, scanY, canvas.width, 40);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, scanY + 20, canvas.width, 2);

      time += 0.05;
      animationFrameId = requestAnimationFrame(drawFeed);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawFeed();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

