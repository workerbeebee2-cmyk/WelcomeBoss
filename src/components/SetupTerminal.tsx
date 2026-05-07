import React, { useState, useRef } from 'react';
import { Upload, X, UserPlus, Play, Music, MonitorPlay, Monitor, Trash2, Wand2, Loader2 } from 'lucide-react';
import type { Guest } from '../App';
import { enhanceImageWithGemini } from '../services/geminiEnhance';

export const BACKGROUND_OPTIONS = [
  { id: 'network', name: 'Neural Network Map' },
  { id: 'deep-neural', name: 'Deep Neural Web' },
  { id: 'radar', name: 'Strategic Radar Sweep' },
  { id: 'satellite', name: 'Drone Surveillance Feed' },
  { id: 'none', name: 'NONE / NOTHING' }
];

export const AUDIO_OPTIONS = [
  { id: 'deep-space', name: 'Deep Space Ambient', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=deep-space-110842.mp3' },
  { id: 'deep-drone', name: 'Deep Bass Drone', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Alex-Productions_-_Deep_%28Dark_Ambient_Background_music%29.oga' },
  { id: 'drone', name: 'Encrypted Drone', url: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Dreamstate_Logic_-_Zero_Point_%28space_ambient%2C_dark_ambient%29.ogg' },
  { id: 'pulse', name: 'Tactical Pulse', url: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Alex-Productions_-_Hidden_%28Aggressive_Electro_Cyberpunk_Midtempo%29.opus' },
  { id: 'custom', name: 'Custom Audio Upload', url: null },
  { id: 'none', name: 'NONE / NOTHING', url: null }
];

interface SetupTerminalProps {
  onStart: (guests: Guest[], audioUrl: string | null, backgroundType: string, companyLogo: string | null, companyName: string) => void;
  initialGuests?: Guest[];
  currentBackground: string;
  onBackgroundChange: (bg: string) => void;
}

export default function SetupTerminal({ onStart, initialGuests = [], currentBackground, onBackgroundChange }: SetupTerminalProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioSelection, setAudioSelection] = useState<string>('deep-space');
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedFileUrl, setEnhancedFileUrl] = useState<string | null>(null);
  
  const [isAudioMenuOpen, setAudioMenuOpen] = useState(false);
  const [isBackgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);
  
  const audioMenuRef = React.useRef<HTMLDivElement>(null);
  const backgroundMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (audioMenuRef.current && !audioMenuRef.current.contains(event.target as Node)) {
        setAudioMenuOpen(false);
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          previewAudioRef.current.currentTime = 0;
        }
      }
      if (backgroundMenuRef.current && !backgroundMenuRef.current.contains(event.target as Node)) {
        setBackgroundMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
    setEnhancedFileUrl(null);
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;
    setIsEnhancing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      try {
        const result = await enhanceImageWithGemini(base64Data, selectedFile.type);
        setEnhancedFileUrl(result);
      } catch (err: any) {
        console.error("Enhancement failed", err);
        alert(`Enhancement failed: ${err.message || 'Unknown error'}. Check console or ensure STABILITY_API_KEY is set in Vercel.`);
      } finally {
        setIsEnhancing(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAddGuest = () => {
    if (!nameInput.trim()) return;
    
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name: nameInput.trim(),
      photoUrl: enhancedFileUrl ? enhancedFileUrl : (selectedFile ? URL.createObjectURL(selectedFile) : null),
      role: roleInput.trim() || undefined,
      department: departmentInput.trim() || undefined
    };

    setGuests([...guests, newGuest]);
    setNameInput('');
    setRoleInput('');
    setDepartmentInput('');
    setSelectedFile(null);
    setEnhancedFileUrl(null);
  };

  const handleRemoveGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const handleStart = () => {
    let finalAudioUrl = null;
    if (audioSelection === 'custom') {
      finalAudioUrl = customAudioFile ? URL.createObjectURL(customAudioFile) : null;
    } else {
      const selected = AUDIO_OPTIONS.find(a => a.id === audioSelection);
      if (selected) finalAudioUrl = selected.url;
    }
    
    let finalLogoUrl = null;
    if (companyLogoFile) {
      finalLogoUrl = URL.createObjectURL(companyLogoFile);
    }
    
    onStart(guests, finalAudioUrl, currentBackground, finalLogoUrl, companyName.trim() || 'SUBJECT ACQUIRED');
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-6">
      
      <div className="intel-card intel-border-top p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-intel-border pb-4">
          <h1 className="font-mono text-xl md:text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-3">
            <span className="text-intel-orange inline-block w-2 h-6 bg-intel-orange animate-pulse"></span>
            VIP Welcome Protocol
          </h1>
          <span className="font-mono text-xs text-intel-orange tracking-widest hidden sm:inline-block">v1.0.4 // INACTIVE</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Guest Entry Form */}
          <div className="space-y-4">
            <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400">Add Guest Identity</h2>
            
            <div>
              <label className="block text-xs font-mono mb-1 text-gray-500">GUEST NAME</label>
              <input 
                type="text" 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                className="w-full bg-intel-dark border border-intel-border p-3 font-sans text-white focus:border-intel-orange focus:outline-none transition-colors"
                placeholder="EX: ALAKESH BORUAH"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-500">ROLE (OPTIONAL)</label>
                <input 
                  type="text" 
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                  className="w-full bg-intel-dark border border-intel-border p-3 font-sans text-white focus:border-intel-orange focus:outline-none transition-colors"
                  placeholder="EX: COMMANDER"
                />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-500">DEPARTMENT (OPTIONAL)</label>
                <input 
                  type="text" 
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
                  className="w-full bg-intel-dark border border-intel-border p-3 font-sans text-white focus:border-intel-orange focus:outline-none transition-colors"
                  placeholder="EX: TACTICAL"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono mb-1 text-gray-500">DOSSIER PHOTO (OPTIONAL)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-intel-border border-dashed cursor-pointer bg-intel-dark hover:bg-black/50 hover:border-intel-orange transition-colors relative overflow-hidden group">
                  {enhancedFileUrl || selectedFile ? (
                    <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                      <img 
                        src={enhancedFileUrl || URL.createObjectURL(selectedFile!)} 
                        alt="Thumbnail" 
                        className="h-16 w-16 object-cover border border-intel-border rounded mb-2 group-hover:border-intel-orange transition-colors" 
                      />
                      <p className="text-xs text-gray-400 group-hover:text-intel-orange font-mono text-center px-2 truncate w-full max-w-[250px] transition-colors">
                        {enhancedFileUrl ? "PHOTO ENHANCED - CLICK TO CHANGE" : selectedFile!.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                      <Upload className="w-6 h-6 mb-2 text-gray-400 group-hover:text-intel-orange transition-colors" />
                      <p className="text-sm text-gray-400 font-mono text-center px-4 group-hover:text-white transition-colors">
                        Select from local library
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {selectedFile && !enhancedFileUrl && (
                <button 
                  onClick={handleEnhance}
                  disabled={isEnhancing}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-black border border-intel-orange/50 hover:bg-intel-orange/20 hover:border-intel-orange text-intel-orange py-2 px-3 font-mono uppercase tracking-widest transition-colors font-bold text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin mx-1" /> : <Wand2 className="w-3 h-3" />}
                  {isEnhancing ? 'ENHANCING VIA DEEPAI SUPER RESOLUTION...' : 'ENHANCE PHOTO (DEEPAI SUPER RESOLUTION)'}
                </button>
              )}
            </div>

            <button 
              onClick={handleAddGuest}
              className="w-full flex items-center justify-center gap-2 bg-intel-border hover:bg-intel-orange text-white py-3 px-4 font-mono uppercase tracking-widest transition-colors font-bold text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Register Identity
            </button>
          </div>

          {/* Configuration & Roster */}
          <div className="space-y-4 flex flex-col h-full">
            <h2 className="font-mono text-sm tracking-widest uppercase text-gray-400">Active Roster</h2>
            
            <div className="flex-1 overflow-y-auto bg-intel-dark border border-intel-border p-3 space-y-2 min-h-[120px]">
              {guests.length === 0 && (
                <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500 italic">
                  NO GUESTS REGISTERED
                </div>
              )}
              {guests.map((guest, idx) => (
                <div key={guest.id} className="flex items-center justify-between bg-black/40 p-2 border border-intel-border/50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-intel-orange">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-sans font-medium">{guest.name}</span>
                    {guest.photoUrl && <span className="text-[10px] bg-intel-border px-1 text-gray-300 rounded-xs uppercase tracking-wider font-mono">Photo</span>}
                  </div>
                  <button onClick={() => handleRemoveGuest(guest.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-mono mb-1 text-gray-500">COMPANY NAME</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-intel-dark border border-intel-border p-3 font-sans text-white focus:border-intel-orange focus:outline-none transition-colors mb-3 placeholder:text-gray-600"
                  placeholder="COMPANY NAME"
                />
              </div>

              <div>
                <label className="block text-xs font-mono mb-1 text-gray-500">COMPANY LOGO (OPTIONAL)</label>
                <div className="relative border border-intel-border/50 bg-intel-dark/50 p-3 hover:border-intel-orange transition-colors group cursor-pointer flex items-center justify-between mb-3">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCompanyLogoFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-intel-orange group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] text-gray-300 truncate max-w-[150px]">
                      {companyLogoFile ? companyLogoFile.name : "Select Logo Image"}
                    </span>
                  </div>
                  {companyLogoFile && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCompanyLogoFile(null); }}
                      className="text-gray-500 hover:text-red-500 z-20 relative p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1 text-gray-500">SYSTEM BACKGROUND</label>
                <div className="relative" ref={backgroundMenuRef}>
                  <div 
                    onClick={() => setBackgroundMenuOpen(!isBackgroundMenuOpen)}
                    className="w-full bg-intel-dark border border-intel-border p-2 focus:border-intel-orange text-white font-mono text-xs pl-8 outline-none cursor-pointer flex items-center justify-between"
                  >
                    <span>{BACKGROUND_OPTIONS.find(o => o.id === currentBackground)?.name || 'Select Background'}</span>
                  </div>
                  <MonitorPlay className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  {isBackgroundMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-intel-dark border border-intel-border z-50 max-h-60 overflow-y-auto">
                      {BACKGROUND_OPTIONS.map(opt => (
                        <div 
                          key={opt.id}
                          className="px-8 py-2 text-xs font-mono text-white hover:bg-intel-orange/20 cursor-pointer"
                          onClick={() => {
                            onBackgroundChange(opt.id);
                            setBackgroundMenuOpen(false);
                          }}
                        >
                          {opt.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono mb-1 text-gray-500">AMBIENT AUDIO</label>
                <div className="relative mb-2" ref={audioMenuRef}>
                  <div 
                    onClick={() => setAudioMenuOpen(!isAudioMenuOpen)}
                    className="w-full bg-intel-dark border border-intel-border p-2 focus:border-intel-orange text-white font-mono text-xs pl-8 outline-none cursor-pointer flex items-center justify-between"
                  >
                    <span>{AUDIO_OPTIONS.find(o => o.id === audioSelection)?.name || 'Select Audio'}</span>
                  </div>
                  <Music className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  {isAudioMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-intel-dark border border-intel-border z-50 max-h-60 overflow-y-auto">
                      {AUDIO_OPTIONS.map(opt => (
                        <div 
                          key={opt.id}
                          className="px-8 py-2 text-xs font-mono text-white hover:bg-intel-orange/20 cursor-pointer"
                          onClick={() => {
                            setAudioSelection(opt.id);
                            setAudioMenuOpen(false);
                            if (previewAudioRef.current) {
                              previewAudioRef.current.pause();
                              previewAudioRef.current.currentTime = 0;
                            }
                          }}
                          onMouseEnter={() => {
                            if (opt.url && previewAudioRef.current) {
                              previewAudioRef.current.src = opt.url;
                              previewAudioRef.current.play().catch(e => console.warn('Preview playback failed', e));
                            }
                          }}
                          onMouseLeave={() => {
                            if (previewAudioRef.current) {
                              previewAudioRef.current.pause();
                              previewAudioRef.current.currentTime = 0;
                            }
                          }}
                        >
                          {opt.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <audio ref={previewAudioRef} className="hidden" />

                {audioSelection === 'custom' && (
                  <div className="flex items-center gap-2 relative">
                    <input 
                        type="file" 
                        id="audio-upload"
                        className="hidden" 
                        accept="audio/*"
                        onChange={(e) => setCustomAudioFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="audio-upload" className="flex items-center gap-2 bg-intel-dark border border-intel-border border-dashed px-3 py-2 cursor-pointer hover:border-intel-orange transition-colors flex-1 w-full justify-center">
                        <span className="text-xs font-mono text-gray-400 truncate">
                          {customAudioFile ? customAudioFile.name : "Select Audio File"}
                        </span>
                      </label>
                      {customAudioFile && (
                        <button onClick={() => setCustomAudioFile(null)} className="absolute right-2 p-1 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        
        <div className="mt-4 border-t border-intel-border pt-6 flex justify-end">
          <button 
            disabled={guests.length === 0}
            onClick={handleStart}
            className="flex items-center gap-2 bg-intel-orange text-white py-4 px-8 font-mono uppercase tracking-widest font-bold hover:bg-[#d9591a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Play className="w-4 h-4 ml-1" />
            Initialize Sequence
          </button>
        </div>
      </div>
      <div className="text-center font-mono text-[10px] text-intel-orange/50 uppercase tracking-widest mt-2 pointer-events-none">
        DESIGNED BY ALAKESH BORUAH (ALEX)
      </div>
    </div>
  );
}
