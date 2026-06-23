
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

const CRAFTING_MESSAGES = [
  "Re-mapping professional skill nodes...",
  "Recalibrating career trajectory...",
  "Optimizing industry alignment...",
  "Syncing professional identity...",
  "Finalizing your new professional DNA..."
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [targetJob, setTargetJob] = useState(profile.targetJob || '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatarUrl || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [craftingStep, setCraftingStep] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through messages during "saving" (crafting) state
  useEffect(() => {
    let interval: number;
    if (saveStatus === 'saving') {
      setCraftingStep(0);
      interval = window.setInterval(() => {
        setCraftingStep(prev => (prev + 1) % CRAFTING_MESSAGES.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [saveStatus]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    const updated: UserProfile = {
      ...profile,
      displayName,
      targetJob,
      skills,
      avatarUrl
    };
    
    // Longer delay to showcase the cool crafting animation
    setTimeout(() => {
      onUpdate(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 4500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* High-End Crafting Animation Overlay */}
      {saveStatus === 'saving' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="max-w-md w-full p-12 text-center relative">
            {/* Geometric Animation */}
            <div className="relative w-48 h-48 mx-auto mb-12">
              <div className="absolute inset-0 border-4 border-brand-500/20 rounded-[2rem] animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 border-4 border-brand-400/40 rounded-[1.5rem] animate-[spin_6s_linear_infinite_reverse]"></div>
              <div className="absolute inset-8 border-4 border-brand-300/60 rounded-[1rem] animate-[spin_3s_linear_infinite]"></div>
              
              {/* Central Core */}
              <div className="absolute inset-[3.5rem] bg-brand-600 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.8)] flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              {/* Data Particles */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-t from-brand-400 to-transparent rounded-full animate-bounce"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-brand-400 to-transparent rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-8 bg-gradient-to-l from-brand-400 to-transparent rounded-full animate-ping"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1 w-8 bg-gradient-to-r from-brand-400 to-transparent rounded-full animate-ping [animation-delay:0.4s]"></div>
            </div>

            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Crafting Your Identity</h2>
            <div className="h-6">
              <p className="text-brand-300 font-bold tracking-widest uppercase text-xs animate-pulse">
                {CRAFTING_MESSAGES[craftingStep]}
              </p>
            </div>
            
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h2>
          <p className="text-gray-500 mt-1">Manage your professional identity and preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Avatar Section */}
          <section className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-3xl bg-brand-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-brand-100 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  displayName ? displayName[0].toUpperCase() : 'U'
                )}
              </div>
              <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black text-gray-900">Profile Picture</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">Upload a high-resolution professional photo for your visual CVs.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                Choose File
              </button>
            </div>
          </section>

          {/* General Info */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              Personal Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Display Name</label>
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <input 
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-gray-400 ml-1 italic">Email cannot be changed.</p>
              </div>
            </div>
          </section>

          {/* Career Target */}
          <section className="space-y-6">
             <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              Career Focus
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Target Job Title</label>
              <input 
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                placeholder="e.g. Senior Software Engineer"
              />
              <p className="text-xs text-gray-500 ml-1">This role will be used by Gemini to tailor your CV and job searches.</p>
            </div>
          </section>

          {/* Skills */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
              Core Skills
            </h3>
            
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-gray-50/50"
                placeholder="Add a skill (e.g. TypeScript, Product Management)"
              />
              <button 
                type="submit"
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95"
              >
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map(skill => (
                  <span 
                    key={skill}
                    className="group flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-bold border border-brand-100 hover:bg-brand-100 transition-colors"
                  >
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="text-brand-300 hover:text-brand-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic py-2">No skills added yet.</p>
              )}
            </div>
          </section>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-10 py-3.5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
              saveStatus === 'saved' 
                ? 'bg-greéeen-500 text-white shadow-green-200' 
                : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-2xl hover:-translate-y-0.5'
            }`}
          >
            {saveStatus === 'saving' ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Crafting...
               </>
            ) : saveStatus === 'saved' ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Identity Recrafted
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;