
import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  profile: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, profile }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    // Use modular signOut from firebase/auth
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'CV Enhancer', path: '/cv-enhancer', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Job Finder', path: '/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Freelance', path: '/freelance', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  const Avatar = ({ className }: { className: string }) => (
    <div className={`${className} rounded-xl bg-brand-500 flex items-center justify-center text-sm font-black overflow-hidden shadow-lg`}>
      {profile?.avatarUrl ? (
        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        profile?.displayName ? profile.displayName[0].toUpperCase() : 'U'
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-900 text-white fixed h-full z-10">
        <div className="p-6">
          <Link to="/dashboard" className="text-2xl font-bold flex items-center gap-3 hover:opacity-90 transition-opacity">
            <Logo className="w-8 h-8 text-brand-400" />
            JobCrafting
          </Link>
          {profile?.targetJob && (
            <div className="mt-4 p-3 bg-brand-800 rounded-lg text-xs">
              <p className="opacity-75 font-medium">Target Role:</p>
              <p className="font-black text-brand-100 mt-1 uppercase tracking-wider">{profile.targetJob}</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-brand-700 text-white shadow-lg' : 'text-brand-100 hover:bg-brand-800'
                }`
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-800">
          <Link 
            to="/profile" 
            className="flex items-center gap-3 mb-4 px-2 py-2 rounded-xl hover:bg-brand-800 transition-all group"
          >
            <div className="group-hover:scale-110 transition-transform">
              <Avatar className="w-10 h-10" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.displayName || 'User'}</p>
              <p className="text-[10px] text-brand-400 truncate uppercase tracking-tighter">View Profile Settings</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-800 hover:bg-brand-700 text-xs font-bold transition-colors border border-brand-700/50"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-brand-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
         <Link to="/dashboard" className="text-lg font-bold flex items-center gap-2">
            <Logo className="w-6 h-6 text-brand-400" />
            JobCrafting
         </Link>
         <div className="flex items-center gap-3">
           <Link to="/profile">
             <Avatar className="w-8 h-8" />
           </Link>
           <button onClick={handleSignOut} className="text-xs bg-brand-800 px-3 py-1.5 rounded-lg font-bold">Sign Out</button>
         </div>
      </header>

      {/* Mobile Nav Bar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[10px] font-bold ${
                  isActive ? 'text-brand-600' : 'text-gray-400'
                }`
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </NavLink>
          ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 mb-16 md:mb-0 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;