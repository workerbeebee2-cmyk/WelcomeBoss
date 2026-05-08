import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Guest } from '../App';
import { ShieldAlert, Crosshair, Radar } from 'lucide-react';

interface SlideshowProps {
  guests: Guest[];
  companyLogo?: string | null;
  companyName?: string;
}

export default function Slideshow({ guests, companyLogo, companyName = 'SUBJECT ACQUIRED' }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [glitchType, setGlitchType] = useState<string | null>(null);

  useEffect(() => {
    // Wait for 10 seconds before swapping to the next guest
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % guests.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [guests.length]);

  useEffect(() => {
    let burstTimeout: NodeJS.Timeout;
    let microTimeout: NodeJS.Timeout;
    let scanlineTimeout: NodeJS.Timeout;
    let nextMicroTimer: NodeJS.Timeout;
    let nextScanlineTimer: NodeJS.Timeout;

    const burstInterval = setInterval(() => {
      const type = `burst-${Math.floor(Math.random() * 4) + 1}`;
      setGlitchType(type);
      burstTimeout = setTimeout(() => {
        setGlitchType(null);
      }, 200);
    }, 10000);

    const scheduleNextMicro = () => {
      const delay = Math.floor(Math.random() * 8000) + 1000; // 1 to 9 seconds
      nextMicroTimer = setTimeout(() => {
        setGlitchType(prev => {
          if (prev && prev.startsWith('burst')) return prev; // If burst is happening, skip
          microTimeout = setTimeout(() => {
            setGlitchType(current => current === 'micro' ? null : current);
          }, 50); // 0.05s duration
          return 'micro';
        });
        scheduleNextMicro(); // Schedule the next one
      }, delay);
    };

    const scheduleNextScanline = () => {
      const delay = Math.floor(Math.random() * 15000) + 5000; // 5 to 20 seconds
      nextScanlineTimer = setTimeout(() => {
        setGlitchType(prev => {
          if (prev && prev.startsWith('burst')) return prev; // Avoid collision
          scanlineTimeout = setTimeout(() => {
            setGlitchType(current => current === 'scanline' ? null : current);
          }, 400); // 0.4s duration
          return 'scanline';
        });
        scheduleNextScanline();
      }, delay);
    };

    scheduleNextMicro();
    scheduleNextScanline();

    return () => {
      clearInterval(burstInterval);
      clearTimeout(nextMicroTimer);
      clearTimeout(nextScanlineTimer);
      clearTimeout(burstTimeout);
      clearTimeout(microTimeout);
      clearTimeout(scanlineTimeout);
    };
  }, []);

  const currentGuest = guests[currentIndex];
  const hasPhoto = !!currentGuest.photoUrl;

  return (
    <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center p-8 overflow-hidden pointer-events-none">
      
      {/* Decorative Technical Top Header */}
      <div className="absolute top-0 w-full flex justify-between p-8 text-intel-orange font-mono text-xs tracking-widest opacity-80 uppercase pointer-events-none">
        <div className="flex gap-4">
          <span>SYS: {new Date().toISOString().split('T')[0].replace(/-/g, '.')}</span>
          <span className="animate-pulse">REC: ACTIVE</span>
        </div>
        <div className="flex gap-4">
          <span>SEC-LVL: CLEARANCE-A</span>
          <span>COORD: {Math.floor(Math.random() * 90)}.{Math.floor(Math.random() * 99)}N / {Math.floor(Math.random() * 180)}.{Math.floor(Math.random() * 99)}W</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentGuest.id}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col ${hasPhoto ? 'lg:flex-row items-center justify-between' : 'items-center justify-center text-center'} gap-16 lg:gap-24 w-full px-8 lg:px-24`}
        >
          {/* Main Content Area */}
          <div className={`flex z-10 min-w-0 w-full ${hasPhoto ? 'flex-1 flex-col justify-center pr-4 lg:pr-12 xl:pl-20' : 'flex-col items-center justify-center'}`}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className={`flex items-center gap-3 text-intel-orange mb-6 font-mono tracking-widest text-sm w-full max-w-[280px] ${hasPhoto ? '' : 'mx-auto justify-center'}`}
            >
              <Radar className="w-5 h-5 animate-[spin_3s_linear_infinite] flex-shrink-0" />
              <div 
                className="flex-1 overflow-hidden relative flex items-center"
                style={{ maskImage: 'linear-gradient(to right, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 70%, transparent 100%)' }}
              >
                <div className="flex animate-[marquee_96s_linear_infinite] whitespace-nowrap min-w-max">
                  {Array(10).fill(`// ${companyName}`).map((text, i) => (
                    <span key={i} className="pr-8">{text}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className={`overflow-hidden mb-2 ${hasPhoto ? '' : 'flex justify-center'}`}>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white font-sans uppercase leading-none drop-shadow-2xl"
                style={{
                  textShadow: '0 0 40px rgba(255,255,255,0.1)'
                }}
              >
                Welcome,
              </motion.h2>
            </div>
            
            <div className={`overflow-visible w-full ${hasPhoto ? '' : 'flex justify-center'}`}>
              <motion.h1
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 1.0, duration: 1 }}
                 className={`text-[clamp(3rem,8vw,9.5rem)] font-bold uppercase tracking-tighter text-white drop-shadow-2xl flex flex-wrap ${hasPhoto ? 'justify-start' : 'justify-center'} gap-x-4 max-w-full leading-[0.85]`}
              >
                 {currentGuest.name.split(' ').map((word, i) => (
                   <span key={i} className="text-intel-orange break-words max-w-full block">
                     {word}
                   </span>
                 ))}
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className={`mt-10 flex gap-4 text-xs font-mono uppercase text-gray-500 tracking-[0.2em] flex-wrap ${hasPhoto ? '' : 'justify-center'}`}
            >
              <div className="flex items-center gap-2 bg-intel-dark px-3 py-2 border border-intel-border">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                <span>{currentGuest.role || 'Identification Verified'}</span>
              </div>
              <div className="flex items-center gap-2 bg-intel-dark px-3 py-2 border border-intel-border">
                <span className="text-intel-orange">{currentGuest.department ? 'DPT:' : 'ID:'}</span>
                <span>{currentGuest.department || currentGuest.id.split('-')[0]}</span>
              </div>
            </motion.div>
          </div>

          {/* Photo Display */}
          {hasPhoto && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="flex-1 flex justify-center w-full"
            >
              <div className={`crosshair-container intel-card p-2 transform rotate-1 hover:rotate-0 transition-transform duration-700 w-full max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] aspect-[3/4] ${glitchType === 'burst-4' ? '!overflow-visible' : 'overflow-hidden'} ${glitchType?.startsWith('burst') ? `glitch-${glitchType}` : glitchType === 'micro' ? 'glitch-micro' : ''}`}>
                <div className="crosshair-inner-before" />
                <div className="crosshair-inner-after" />
                <div className="absolute inset-0 border border-intel-orange/20 pointer-events-none z-20 m-2" />
                
                {glitchType?.startsWith('burst') && (
                  <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)] z-30 opacity-70 mix-blend-overlay" />
                )}
                {glitchType?.startsWith('burst') && (
                  <div className="absolute inset-0 pointer-events-none bg-white z-40 opacity-20 animate-pulse" />
                )}

                <div className={`w-full h-full bg-intel-darker relative ${glitchType === 'burst-4' ? '!overflow-visible' : 'overflow-hidden'}`}>
                  {glitchType === 'scanline' && (
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.8),0_0_10px_rgba(242,103,34,0.5)] z-50 animate-scanline" />
                  )}
                  <div 
                    className="w-full h-full bg-cover bg-center filter grayscale contrast-[1.2] opacity-80 mix-blend-screen animate-breathe"
                    style={{ backgroundImage: `url(${currentGuest.photoUrl})` }}
                  />
                  
                  {glitchType === 'burst-4' && (
                    <div className="absolute inset-0 z-50 pointer-events-none animate-slice-jitter mix-blend-screen">
                      <div className="absolute inset-0 w-full h-full bg-cover bg-center filter hue-rotate-[90deg] translate-x-[-15%]" style={{ backgroundImage: `url(${currentGuest.photoUrl})`, clipPath: 'inset(20% 0 65% 0)' }} />
                      <div className="absolute inset-0 w-full h-full bg-cover bg-center filter invert translate-x-[12%]" style={{ backgroundImage: `url(${currentGuest.photoUrl})`, clipPath: 'inset(50% 0 30% 0)' }} />
                      <div className="absolute inset-0 w-full h-full bg-cover bg-center filter brightness-150 grayscale translate-x-[-8%]" style={{ backgroundImage: `url(${currentGuest.photoUrl})`, clipPath: 'inset(75% 0 10% 0)' }} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
        </motion.div>
      </AnimatePresence>

      {/* Decorative Bottom Elements */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end pointer-events-none">
        <div className="flex flex-col gap-1 w-64">
           {/* Fake loading bars */}
           <div className="h-1 bg-intel-border w-full overflow-hidden">
             <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: '300%' }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               className="h-full w-1/3 bg-intel-orange" 
             />
           </div>
           <div className="text-[10px] font-mono text-gray-600 mt-2">LINK SECURE // ENCRYPTED CONNECTION</div>
        </div>
        
        <div className="flex items-end gap-6 text-right">
           <div className="text-6xl font-bold text-intel-border/30 font-mono select-none pointer-events-none tracking-tighter mb-[-4px]">
             {String(currentIndex + 1).padStart(2, '0')}<span className="text-2xl">/{String(guests.length).padStart(2, '0')}</span>
           </div>
           {companyLogo && (
             <img 
               src={companyLogo} 
               alt="Company Logo" 
               className="max-w-[120px] max-h-[80px] object-contain opacity-70 z-50 pointer-events-none mix-blend-screen" 
             />
           )}
        </div>
      </div>

    </div>
  );
}

