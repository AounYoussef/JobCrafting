
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Chatbot from './components/Chatbot';
import CVEnhancer from './components/CVEnhancer';
import JobFinder from './components/JobFinder';
import ProfileSettings from './components/ProfileSettings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load profile from localStorage to simulate DB persistence for demo
        const savedProfile = localStorage.getItem(`jobcraft_profile_${currentUser.uid}`);
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        } else {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            hasOnboarded: false
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    if (user) {
      localStorage.setItem(`jobcraft_profile_${user.uid}`, JSON.stringify(updatedProfile));
    }
  };

  const handleOnboardingComplete = (targetJob: string) => {
    if (!user || !profile) return;
    
    const newProfile: UserProfile = {
      ...profile,
      targetJob,
      hasOnboarded: true
    };
    
    handleProfileUpdate(newProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Auth /> : <Navigate to="/dashboard" />} 
        />
        
        <Route
          path="/onboarding"
          element={
            user ? (
              !profile?.hasOnboarded ? (
                <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
                   <div className="w-full max-w-4xl mb-8 text-center">
                     <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.displayName?.split(' ')[0] || 'Traveler'}</h1>
                     <p className="text-gray-600 font-medium">Let's craft your career journey together.</p>
                   </div>
                   <div className="w-full">
                     <Chatbot onComplete={handleOnboardingComplete} />
                   </div>
                </div>
              ) : (
                <Navigate to="/dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user && profile?.hasOnboarded ? (
              <Layout profile={profile}>
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                    
                    <h1 className="text-4xl font-black mb-4 relative z-10">Welcome Back, {profile.displayName?.split(' ')[0] || 'User'}!</h1>
                    <p className="opacity-90 text-xl font-medium relative z-10">
                      Your current target: <span className="font-black border-b-4 border-brand-400 pb-1 uppercase tracking-wider">{profile.targetJob}</span>
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
                      <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <span className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center text-sm">01</span>
                        Roadmap
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-4 text-gray-700 font-bold bg-green-50/50 p-3 rounded-2xl border border-green-100">
                          <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shadow-lg shadow-green-200">✓</span>
                          Career Assessment
                        </li>
                        <li className="flex items-center gap-4 text-gray-700 font-bold p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                          <span className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs shadow-lg shadow-brand-200">2</span>
                          Optimize your CV
                        </li>
                         <li className="flex items-center gap-4 text-gray-400 font-bold p-3 rounded-2xl opacity-60">
                          <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs">3</span>
                          Search Matches
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-center items-center text-center group">
                       <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       </div>
                       <h3 className="text-2xl font-black text-gray-900">Career Wisdom</h3>
                       <p className="text-lg text-gray-500 mt-4 leading-relaxed font-medium px-4 italic">
                        "Job crafting isn't just about changing jobs, it's about changing how you perceive and execute your daily tasks."
                       </p>
                    </div>
                  </div>
                </div>
              </Layout>
            ) : (
               user ? <Navigate to="/onboarding" /> : <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/cv-enhancer"
          element={
            user && profile?.hasOnboarded ? (
              <Layout profile={profile}>
                <CVEnhancer targetJob={profile.targetJob || ''} />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/jobs"
          element={
            user && profile?.hasOnboarded ? (
              <Layout profile={profile}>
                <JobFinder targetJob={profile.targetJob || ''} />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/freelance"
          element={
             user && profile?.hasOnboarded ? (
              <Layout profile={profile}>
                <JobFinder targetJob={profile.targetJob || ''} isFreelance={true} />
              </Layout>
             ) : (
              <Navigate to="/" />
             )
          }
        />

        <Route
          path="/profile"
          element={
            user && profile?.hasOnboarded ? (
              <Layout profile={profile}>
                <ProfileSettings profile={profile} onUpdate={handleProfileUpdate} />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;