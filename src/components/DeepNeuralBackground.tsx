import { useEffect, useRef } from 'react';

interface Node {
  ox: number; 
  oy: number;
  x: number;
  y: number;
  radius: number;
  driftOffset: number;
  isOrange: boolean;
  links: number[]; // indices of nodes in the next layer
}

interface Signal {
  c: number; // column index
  r: number; // row index (from node)
  t: number; // target row index (to node in next col)
  progress: number;
  speed: number;
  isOrange: boolean;
}

export default function DeepNeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let layers: Node[][] = [];
    let signals: Signal[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNetwork();
    };

    const initNetwork = () => {
      layers = [];
      signals = [];
      const layerSpacing = window.innerWidth > 768 ? 350 : 200;
      const numCols = Math.ceil(canvas.width / layerSpacing) + 2;
      
      for (let c = 0; c < numCols; c++) {
        const nodeSpacing = window.innerHeight > 768 ? 220 : 140;
        const numNodes = Math.floor(canvas.height / nodeSpacing) + (Math.random() > 0.5 ? 2 : -1);
        let layer: Node[] = [];
        
        for (let r = 0; r < numNodes; r++) {
          layer.push({
            ox: (c - 0.5) * layerSpacing + (Math.random() * 40 - 20),
            oy: (r + 0.5) * (canvas.height / numNodes) + (Math.random() * 40 - 20),
            x: 0,
            y: 0,
            radius: Math.random() * 2 + 1,
            driftOffset: Math.random() * Math.PI * 2,
            isOrange: Math.random() > 0.85,
            links: []
          });
        }
        layers.push(layer);
      }

      // Build forward connections
      for (let c = 0; c < numCols - 1; c++) {
        for (let i = 0; i < layers[c].length; i++) {
          // Connect to 1-2 random nodes in the next layer
          let linksCount = Math.floor(Math.random() * 2) + 1;
          for (let l = 0; l < linksCount; l++) {
            let target = Math.floor(Math.random() * layers[c+1].length);
            if (!layers[c][i].links.includes(target)) {
              layers[c][i].links.push(target);
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.001;

      // Update node positions with drift
      for (let c = 0; c < layers.length; c++) {
        for (let i = 0; i < layers[c].length; i++) {
          let n = layers[c][i];
          n.x = n.ox + Math.sin(time * 0.5 + n.driftOffset) * 15;
          n.y = n.oy + Math.cos(time * 0.4 + n.driftOffset) * 15;
        }
      }

      // Draw faint physical links
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let c = 0; c < layers.length - 1; c++) {
        for (let i = 0; i < layers[c].length; i++) {
          const n1 = layers[c][i];
          for (let t of n1.links) {
            const n2 = layers[c+1][t];
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      // Trigger new signals (pulses)
      if (Math.random() < 0.15) {
        // Favor starting at the left side, but can spawn anywhere
        const startCol = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * (layers.length - 2));
        if (layers[startCol] && layers[startCol].length > 0) {
          const startRow = Math.floor(Math.random() * layers[startCol].length);
          const links = layers[startCol][startRow].links;
          if (links.length > 0) {
            signals.push({
              c: startCol,
              r: startRow,
              t: links[Math.floor(Math.random() * links.length)],
              progress: 0,
              speed: Math.random() * 0.003 + 0.001,
              isOrange: Math.random() > 0.6
            });
          }
        }
      }

      // Update and draw signals
      for (let i = signals.length - 1; i >= 0; i--) {
        let sig = signals[i];
        sig.progress += sig.speed;
        
        if (sig.progress >= 1) {
          // If a signal reaches the end of an edge, it has a high chance to propagate forward
          if (sig.c + 1 < layers.length - 1 && Math.random() > 0.1) {
            const nextLinks = layers[sig.c + 1][sig.t].links;
            if (nextLinks.length > 0) {
              sig.c++;
              sig.r = sig.t;
              sig.t = nextLinks[Math.floor(Math.random() * nextLinks.length)];
              sig.progress = 0;
              continue; // Keep iterating with new target
            }
          }
          // Remove if it didn't propagate or hit the end
          signals.splice(i, 1);
          continue;
        }

        const nFrom = layers[sig.c][sig.r];
        const nTo = layers[sig.c + 1][sig.t];

        const sx = nFrom.x + (nTo.x - nFrom.x) * sig.progress;
        const sy = nFrom.y + (nTo.y - nFrom.y) * sig.progress;

        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = sig.isOrange ? 'rgba(242, 103, 34, 1)' : 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = sig.isOrange ? '#f26722' : '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }

      // Draw Nodes
      for (let c = 0; c < layers.length; c++) {
        for (let i = 0; i < layers[c].length; i++) {
          let n = layers[c][i];
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI*2);
          ctx.fillStyle = n.isOrange ? 'rgba(242, 103, 34, 0.5)' : 'rgba(255, 255, 255, 0.2)';
          ctx.fill();

          if (n.isOrange) {
            ctx.strokeStyle = 'rgba(242, 103, 34, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x - 4, n.y); ctx.lineTo(n.x + 4, n.y);
            ctx.moveTo(n.x, n.y - 4); ctx.lineTo(n.x, n.y + 4);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 bg-intel-darker" />;
}
