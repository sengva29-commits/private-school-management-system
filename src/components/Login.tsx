/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Key, Eye, EyeOff, User, BookOpen, GraduationCap, Award, Lock, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: { id: string; name: string; role: UserRole; username: string; avatarColor: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Predefined users for quick, high-trust simulation + standard login
  const accounts = [
    { id: 'USR_SUPER1', name: 'SENG VANDA', username: 'vanda', role: 'super_admin' as UserRole, desc: 'Super Admin', color: 'bg-[#0B1E43]' },
    { id: 'USR_ADMIN1', name: 'KEO SOPHEA', username: 'sophea', role: 'school_admin' as UserRole, desc: 'School Admin', color: 'bg-blue-600' },
    { id: 'TCH001', name: 'CHHIM BORITH', username: 'borith', role: 'teacher' as UserRole, desc: 'Teacher Leader', color: 'bg-emerald-600' },
    { id: 'USR_ACCT1', name: 'LIM SOPHEAK', username: 'sopheak', role: 'accountant' as UserRole, desc: 'Senior Accountant', color: 'bg-amber-600' },
    { id: 'STD0001', name: 'KONG SOPHA', username: 'sopha', role: 'student_parent' as UserRole, desc: 'Student / Parent Portal', color: 'bg-violet-600' },
  ];

  // Custom user register/login state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('teacher');
  const [customUsername, setCustomUsername] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('សូមបញ្ចូលឈ្មោះគណនី!');
      return;
    }

    const matched = accounts.find(
      acc => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (matched) {
      onLogin({
        id: matched.id,
        name: matched.name,
        role: matched.role,
        username: matched.username,
        avatarColor: matched.color,
      });
    } else {
      // Allow general user logins
      onLogin({
        id: `USR_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        name: username.toUpperCase(),
        role: 'school_admin',
        username: username.toLowerCase(),
        avatarColor: 'bg-slate-650',
      });
    }
  };

  const handleQuickLogin = (acc: typeof accounts[0]) => {
    onLogin({
      id: acc.id,
      name: acc.name,
      role: acc.role,
      username: acc.username,
      avatarColor: acc.color,
    });
  };

  const handleCreateCustomAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUsername.trim()) {
      setError('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }

    const nextId = customRole === 'teacher' ? `TCH${Math.floor(100 + Math.random() * 900)}` : `USR_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    onLogin({
      id: nextId,
      name: customName.toUpperCase(),
      role: customRole,
      username: customUsername.toLowerCase(),
      avatarColor: 'bg-brand-600',
    });
  };

  return (
    <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden text-slate-100 flex flex-col my-4">
      
      {/* School Branding Header */}
      <div className="p-6 text-center space-y-3 bg-slate-950/70 border-b border-slate-800">
        {/* Logo - completely plain crisp square container as requested */}
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0B1E43] text-white font-black rounded-xs shadow-md text-3xl mx-auto border-none shrink-0 overflow-hidden">
          ⚔️
        </div>
        
        <div className="space-y-1">
          <h1 className="text-xl font-bold font-moul text-amber-400 tracking-wide leading-normal">សាលាអន្តរជាតិ វីរៈជន</h1>
          <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-widest font-mono">HEROES INTERNATIONAL SCHOOL</span>
        </div>
        
        {/* Motto- Slogan */}
        <div className="py-1 px-4 bg-amber-500/10 border border-amber-500/20 inline-block rounded-full">
          <p className="text-2xs font-extrabold text-amber-300 tracking-wider">
            ចំណេះដឹង • បំណិន • ឥរិយាបថ
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {error && (
          <div className="p-3 border border-red-500/30 bg-red-950/50 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Toggle Mode Buttons - Rounded-xl */}
        <div className="flex border border-slate-850 rounded-2xl bg-slate-950/60 p-1">
          <button
            onClick={() => { setIsCustomMode(false); setError(''); }}
            className={`flex-1 py-2 text-center text-xs font-extrabold transition-all cursor-pointer rounded-xl ${!isCustomMode ? 'bg-amber-550 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            គណនីគំរូសាកល្បង
          </button>
          <button
            onClick={() => { setIsCustomMode(true); setError(''); }}
            className={`flex-1 py-2 text-center text-xs font-extrabold transition-all cursor-pointer rounded-xl ${isCustomMode ? 'bg-amber-550 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            បង្កើតគណនីថ្មី
          </button>
        </div>

        {!isCustomMode ? (
          <div className="space-y-4">
            {/* Quick login list */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-450 block tracking-widest">ជ្រើសរើសចូលប្រព័ន្ធរហ័ស</span>
              
              <div className="grid grid-cols-1 gap-2">
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => handleQuickLogin(acc)}
                    className="w-full text-left p-2.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 hover:border-amber-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center text-xs font-black text-white uppercase rounded-xl shadow-inner ${acc.color}`}>
                        {acc.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block text-xs font-extrabold text-slate-200 group-hover:text-amber-300 transition-colors">{acc.name}</span>
                        <span className="block text-[10px] text-slate-450 font-mono">User: {acc.username}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-slate-750 text-amber-400 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {acc.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-805"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">ឬចូលតាមគណនីឯកជន</span>
              <div className="flex-grow border-t border-slate-805"></div>
            </div>

            {/* Standard Login Form - Rounded Input and Buttons */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-400 block mb-1">ឈ្មោះគណនី (Username)</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-950 focus:outline-none rounded-xl text-xs font-bold text-white transition-all shadow-inner"
                    placeholder="វាយបញ្ចូលឈ្មោះគណនី (ឧ. vanda)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-400 block mb-1">លេខសម្ងាត់ (Password)</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-950 focus:outline-none rounded-xl text-xs font-bold text-white transition-all shadow-inner"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>ចូលប្រព័ន្ធ</span>
              </button>
            </form>
          </div>
        ) : (
          /* Custom Account Form */
          <form onSubmit={handleCreateCustomAndLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-extrabold text-slate-400 block mb-1">ឈ្មោះពេញ (Full Name)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-950 focus:outline-none rounded-xl text-xs font-bold text-white shadow-inner"
                placeholder="ឈ្មោះជាភាសាអង់គ្លេស ឬ ខ្មែរ"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-400 block mb-1 font-mono">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 focus:border-amber-500 focus:bg-slate-950 focus:outline-none rounded-xl text-xs font-bold text-white shadow-inner"
                placeholder="ឧទាហរណ៍៖ vanda123"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-400 block mb-1">តួនាទី (School Role)</label>
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value as UserRole)}
                className="w-full bg-slate-950/80 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="super_admin">Super Admin (អ្នកគ្រប់គ្រងជាន់ខ្ពស់)</option>
                <option value="school_admin">School Admin (នាយកសាលា)</option>
                <option value="teacher">Teacher Coordinator (អ្នកសម្របសម្រួលគ្រូ)</option>
                <option value="accountant">Accountant Desk (គណនេយ្យករ)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>បង្កើតគណនី និងចូលប្រព័ន្ធ</span>
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-widest leading-loose">
            🔒 Elite Secure Portal • v4.2.0
          </span>
        </div>

      </div>

    </div>
  );
}
