import { useEffect, useRef } from 'react';

export default function RadarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    
    // Generate some static "targets" or map points
    const points: {x: number, y: number, label: string, active: boolean}[] = [];
    for(let i=0; i<30; i++) {
        points.push({
            x: Math.random() * 2 - 1, // normalized -1 to 1
            y: Math.random() * 2 - 1,
            label: `TGT-${Math.floor(Math.random()*9000)+1000}`,
            active: Math.random() > 0.5
        });
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 1.2; // fill more
      
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = (centerX % gridSize); x < canvas.width; x += gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = (centerY % gridSize); y < canvas.height; y += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw concentric circles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([5, 5]);
      for (let i = 1; i <= 6; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 6) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Map Points
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '9px "JetBrains Mono"';
      points.forEach(p => {
          const px = centerX + p.x * radius;
          const py = centerY + p.y * radius;
          
          if (px > 0 && px < canvas.width && py > 0 && py < canvas.height) {
              // Calc distance to sweep angle
              const pointAngle = Math.atan2(p.y, p.x);
              let normalizedPointAngle = pointAngle;
              if (normalizedPointAngle < 0) normalizedPointAngle += Math.PI * 2;
              
              const sweepAngle = angle % (Math.PI * 2);
              let diff = sweepAngle - normalizedPointAngle;
              if (diff < 0) diff += Math.PI * 2;
              
              let highlight = false;
              if (diff < 0.2) {
                  highlight = true;
                  p.active = !p.active; // Occasionally flip state on sweep
              }
              
              ctx.beginPath();
              if (highlight) {
                  ctx.arc(px, py, 3, 0, Math.PI * 2);
                  ctx.fillStyle = 'rgba(242, 103, 34, 0.8)';
                  ctx.shadowBlur = 10;
                  ctx.shadowColor = 'rgba(242, 103, 34, 1)';
                  ctx.fill();
                  ctx.shadowBlur = 0;
                  ctx.fillText(`${p.label} [ACT]`, px + 8, py + 3);
              } else {
                  ctx.rect(px - 1, py - 1, 2, 2);
                  ctx.fillStyle = p.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
                  ctx.fill();
                  if (p.active) {
                      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                      ctx.fillText(p.label, px + 6, py + 3);
                  }
              }
          }
      });

      // Draw sweep
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      const gradient = ctx.createConicGradient(0, 0, 0);
      gradient.addColorStop(0, 'rgba(242, 103, 34, 0)');
      gradient.addColorStop(0.05, 'rgba(242, 103, 34, 0)');
      gradient.addColorStop(0.1, 'rgba(242, 103, 34, 0.0)');
      gradient.addColorStop(1, 'rgba(242, 103, 34, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Sweep leading line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius, 0);
      ctx.strokeStyle = 'rgba(242, 103, 34, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();
      
      // Coordinates at edges
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillText(`LAT: ${(angle * 10).toFixed(4)}`, canvas.width - 120, canvas.height - 20);
      ctx.fillText(`LNG: ${(Math.sin(angle) * 100).toFixed(4)}`, canvas.width - 120, canvas.height - 35);

      angle += 0.005; // Make it significantly slower
      animationFrameId = requestAnimationFrame(drawRadar);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawRadar();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#08090a' }}
    />
  );
}