import { useState, useRef, useEffect } from 'react';
import NetworkBackground from './components/NetworkBackground';
import DeepNeuralBackground from './components/DeepNeuralBackground';
import RadarBackground from './components/RadarBackground';
import SatelliteBackground from './components/SatelliteBackground';
import SetupTerminal from './components/SetupTerminal';
import Slideshow from './components/Slideshow';
import { Volume2, VolumeX, Maximize, Minimize, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type Guest = {
  id: string;
  name: string;
  photoUrl: string | null;
  role?: string;
  department?: string;
};

export default function App() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<string>('network');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('SUBJECT ACQUIRED');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStart = (configuredGuests: Guest[], configuredAudioUrl: string | null, configuredBg: string, configuredLogo: string | null, configuredName: string) => {
    setGuests(configuredGuests);
    setAudioUrl(configuredAudioUrl);
    setBackgroundType(configuredBg);
    setCompanyLogoUrl(configuredLogo);
    setCompanyName(configuredName);
    setIsStarted(true);
    setIsAudioPlaying(true);
  };

  const handleBack = () => {
    setIsStarted(false);
    setIsAudioPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const renderBackground = () => {
    if (backgroundType === 'radar') return <RadarBackground />;
    if (backgroundType === 'satellite') return <SatelliteBackground />;
    if (backgroundType === 'deep-neural') return <DeepNeuralBackground />;
    return <NetworkBackground />;
  };

  return (
    <div className="relative min-h-screen bg-intel-darker text-white overflow-hidden font-sans">
      
      {/* Background layer */}
      {renderBackground()}
      
      {/* Content layer */}
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen items-center justify-center p-4 px-6 md:px-12 w-full"
          >
            <SetupTerminal 
              onStart={handleStart} 
              initialGuests={guests} 
              currentBackground={backgroundType}
              onBackgroundChange={setBackgroundType}
            />
          </motion.div>
        ) : (
          <motion.div
            key="slideshow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute inset-0"
          >
            <Slideshow guests={guests} companyLogo={companyLogoUrl} companyName={companyName} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Controls Overlay */}
      {isStarted && (
        <div className="fixed top-24 right-8 z-50 flex flex-col gap-2">
          <button
            onClick={toggleAudio}
            className="border border-intel-border/50 bg-intel-dark/50 p-2 text-gray-500 hover:text-intel-orange transition-all hover:bg-intel-orange/10 flex items-center justify-center backdrop-blur-md relative"
            title="Toggle Audio"
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            
            {/* Audio indicator */}
            {isAudioPlaying && (
              <div className="absolute -bottom-[1px] left-0 w-full h-[1px] flex justify-center">
                <div className="h-full bg-intel-orange w-1/3 animate-pulse"></div>
              </div>
            )}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="border border-intel-border/50 bg-intel-dark/50 p-2 text-gray-500 hover:text-white transition-all hover:bg-white/5 flex items-center justify-center backdrop-blur-md"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Back Button Overlay */}
      <AnimatePresence>
        {isStarted && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={handleBack}
            className="fixed top-24 left-8 z-50 border border-intel-border/50 bg-intel-dark/50 p-2 text-gray-500 hover:text-intel-orange transition-all hover:bg-intel-orange/10 flex items-center justify-center font-mono text-[10px] uppercase tracking-widest gap-2 backdrop-blur-md"
            title="Return to configuration"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Abort sequence</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          loop
          autoPlay={isAudioPlaying}
          className="hidden"
          title="Ambient Background Audio"
        />
      )}

      {/* Grid overlay for technical vibe */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
    </div>
  );
}
