/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Save, User, RefreshCw, Layout, AppWindow, Palette, Check, Key, Bell, CreditCard, Sliders, AlertTriangle } from 'lucide-react';
import { getTeacherPasscode } from '../utils';
import ImageUploader from './ImageUploader';

interface SettingsProps {
  currentUser: { id: string; name: string; role: UserRole; username: string; avatarColor: string; photoUrl?: string; password?: string };
  onUpdateSettings: (updatedFields: { name: string; username: string; avatarColor: string; photoUrl?: string; password?: string }) => void;
  schoolNameKhmer: string;
  schoolNameEnglish: string;
  schoolSlogan: string;
  schoolLogo: string;
  onUpdateSchoolSettings: (updates: { schoolNameKhmer?: string; schoolNameEnglish?: string; schoolSlogan?: string; schoolLogo?: string }) => void;
  onClearData: () => void;
  onImportSampleSchoolData?: () => void;
  isCompactMode: boolean;
  onToggleCompactMode: (val: boolean) => void;
  onLogAction: (action: string, details: string) => void;
}

export default function Settings({
  currentUser,
  onUpdateSettings,
  schoolNameKhmer,
  schoolNameEnglish,
  schoolSlogan,
  schoolLogo,
  onUpdateSchoolSettings,
  onClearData,
  onImportSampleSchoolData,
  isCompactMode,
  onToggleCompactMode,
  onLogAction
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'school' | 'system'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [avatarColor, setAvatarColor] = useState(currentUser.avatarColor);
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || '');
  const [password, setPassword] = useState(currentUser.password || 'admin123');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // School settings states
  const [schKhmer, setSchKhmer] = useState(schoolNameKhmer);
  const [schEnglish, setSchEnglish] = useState(schoolNameEnglish);
  const [schSlogan, setSchSlogan] = useState(schoolSlogan);
  const [schLogo, setSchLogo] = useState(schoolLogo);

  const colors = [
    { class: 'bg-[#0B1E43]', value: 'bg-[#0B1E43]', label: 'ខៀវចាស់ (Navy)' },
    { class: 'bg-indigo-900', value: 'bg-indigo-900', label: 'ស្វាយចាស់ (Indigo)' },
    { class: 'bg-emerald-800', value: 'bg-emerald-800', label: 'បៃតងចាស់ (Emerald)' },
    { class: 'bg-slate-900', value: 'bg-slate-900', label: 'ធ្យូងចាស់ (Charcoal)' },
    { class: 'bg-sky-950', value: 'bg-sky-950', label: 'ខៀវភ្លឺ (Sky)' },
    { class: 'bg-violet-900', value: 'bg-violet-900', label: 'ពណ៌ស្វាយ (Violet)' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      alert('សូមបំពេញឈ្មោះ និងឈ្មោះគណនី! Please enter your name and username.');
      return;
    }

    onUpdateSettings({
      name: name.toUpperCase(),
      username: username.toLowerCase(),
      avatarColor,
      photoUrl,
      password
    });

    onLogAction('UPDATE_PROFILE', `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានគណនីផ្ទាល់ខ្លួន៖ ${name} (${username})`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const roleNameKhmer = (role: UserRole) => {
    switch(role) {
      case 'super_admin': return 'អភិបាលជាន់ខ្ពស់';
      case 'school_admin': return 'អភិបាលសាលា';
      case 'teacher': return 'លោកគ្រូ/អ្នកគ្រូ';
      case 'accountant': return 'គណនេយ្យករ';
      default: return 'សិស្ស/អាណាព្យាបាល';
    }
  };

  return (
    <div className="space-y-3 font-sans max-w-2xl mx-auto">
      {/* Title Section */}
      <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-500" />
            ការកំណត់គណនីប្រព័ន្ធ • Settings & Configuration
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-semibold">
            គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន រូបតំណាង ពណ៌ប្រព័ន្ធ និងអត្តសញ្ញាណសាលារៀន
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border border-slate-100 bg-slate-50 p-1 rounded-lg gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>គណនីផ្ទាល់ខ្លួន (Profile)</span>
        </button>

        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('school')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === 'school'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AppWindow className="w-4 h-4 shrink-0" />
            <span>អត្តសញ្ញាណសាលា (School Name)</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-bold rounded-md transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span>ការកំណត់ប្រព័ន្ធ (System)</span>
        </button>
      </div>

      {/* Content Panels / Cards based on Active Tab */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-4.5 space-y-4">
        {saveSuccess && (
          <div className="p-3 border border-emerald-200 bg-emerald-50 text-emerald-800 text-[13px] font-bold rounded-lg flex items-center gap-2 animate-fade-in">
            <Check className="w-4.5 h-4.5 text-emerald-600" />
            <span>រក្សាទុកការផ្លាស់ប្តូរដោយជោគជ័យ! Profile update saved successfully!</span>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Identity Profile Header Card */}
            <div className="p-4 bg-slate-50 border border-slate-100 flex items-center gap-4 rounded-lg">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                />
              ) : (
                <div className={`w-14 h-14 flex items-center justify-center text-lg font-extrabold text-white rounded-full uppercase shrink-0 shadow-sm ${avatarColor}`}>
                  {name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[13px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                  តួនាទី៖ {roleNameKhmer(currentUser.role)}
                </span>
                <span className="font-black text-sm text-slate-900 block truncate">{name}</span>
                <span className="text-[13px] text-slate-400 font-mono block mt-0.5">
                  UID: <span className="font-bold">{currentUser.id}</span> &nbsp;•&nbsp; User: <span className="font-bold">{username}</span>
                </span>
              </div>
            </div>

            {/* Display passcode if current user is a teacher */}
            {currentUser.role === 'teacher' && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg space-y-2">
                <span className="text-amber-900 font-black block text-[13px] flex items-center gap-1.5">
                  🔑 លេខកូដអនុម័តបដិសេធរបស់អ្នក (Class Teacher Approval Passcode)
                </span>
                <p className="text-[13px] text-slate-600 leading-relaxed font-semibold">
                  ប្រើលេខកូដនេះនៅពេល Admin ធ្វើការកែសម្រួលទិន្នន័យផ្សេងៗរបស់សិស្សក្នុងថ្នាក់ដឹកនាំរបស់អ្នក៖
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-md font-mono font-black text-amber-800 bg-white border border-amber-200 px-3 py-1 rounded inline-block tracking-widest shadow-xs">
                    {getTeacherPasscode(currentUser.id)}
                  </span>
                  <span className="text-[13px] text-amber-600 font-medium italic">
                    (បង្ហាញចំពោះលោកគ្រូ/អ្នកគ្រូផ្ទាល់តែប៉ុណ្ណោះ)
                  </span>
                </div>
              </div>
            )}

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ឈ្មោះបង្ហាញ (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឈ្មោះពេញរបស់អ្នក"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg text-[13px] font-semibold transition-all hover:border-slate-350"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ឈ្មោះគណនីចូលប្រព័ន្ធ (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="Username សម្រាប់ចូលប្រើ"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg text-[13px] font-semibold transition-all hover:border-slate-350"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Password update input */}
              <div className="sm:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ប្តូរលេខសម្ងាត់ថ្មី (Change Account Password) *</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="បញ្ចូលលេខសម្ងាត់ថ្មី"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg text-[13px] font-bold font-mono transition-all hover:border-slate-350"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Custom drag-drop ImageUploader */}
              <div className="sm:col-span-2">
                <ImageUploader
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  label="រូបថតគណនីផ្ទាល់ខ្លួន (Personal Profile Photo)"
                  helperText="អូស និងទម្លាក់រូបភាព ឬចុចលើផ្នែកខាងលើដើម្បីជ្រើសរើសរូបថតប្រវត្តិរូបផ្ទុករូបភាព PNG/JPG"
                />
              </div>
            </div>

            {/* Profile color bar selection */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <label className="text-[13px] font-bold text-slate-700 block">ជ្រើសរើសពណ៌របារពណ៌ខាងលើបង្អស់ (Top Header Accent Theme Group)</label>
              <div className="flex flex-wrap gap-2.5">
                {colors.map(col => {
                  const isSelected = avatarColor === col.value;
                  return (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setAvatarColor(col.value)}
                      title={col.label}
                      className={`relative w-8 h-8 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                        isSelected ? 'border-indigo-600 scale-105 ring-2 ring-indigo-100 ring-offset-1' : 'border-slate-300'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full block ${col.class}`}></span>
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 rounded-full">
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[13px] px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all active:scale-98"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                រក្សាទុកគណនី (Save Profile Settings)
              </button>
            </div>
          </form>
        )}

        {/* SCHOOL SETUP TAB (Super Admin Only) */}
        {activeTab === 'school' && currentUser.role === 'super_admin' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-[14px] uppercase tracking-wide flex items-center gap-1.5">
                🏫 ការកំណត់ស្លាកសញ្ញាសាលា និងអត្តសញ្ញាណ (School Identity Branding Setup)
              </h3>
              <p className="text-[13px] text-slate-400 mt-1 font-semibold">
                កែសម្រួលរូបភាពនិមិត្តសញ្ញា ឈ្មោះសាលារៀនខ្មែរ-អង់គ្លេស និងពាក្យស្លោកបង្ហាញលើរបាររចនាបថខាងលើបង្អស់
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ឈ្មោះគ្រឹះស្ថានសិក្សា (ភាសាខ្មែរ) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សាលាបឋមសិក្សាវត្តបុទុម"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg text-[13px] font-semibold transition-all hover:border-slate-350"
                  value={schKhmer}
                  onChange={(e) => setSchKhmer(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">School Official Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wat Botum Primary School"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg text-[13px] font-semibold transition-all hover:border-slate-350"
                  value={schEnglish}
                  onChange={(e) => setSchEnglish(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">ទិសស្លោករបស់សាលា ឬព័ត៌មានបន្ថែម (School Tagline / Slogan Banner) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. វិន័យ សីលធម៌ គុណភាព និងការអភិវឌ្ឍន៌"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg text-[13px] font-semibold transition-all hover:border-slate-350"
                  value={schSlogan}
                  onChange={(e) => setSchSlogan(e.target.value)}
                />
              </div>

              {/* Logo setup (Base64 file uploader) */}
              <div className="sm:col-span-2">
                <ImageUploader
                  value={schLogo}
                  onChange={setSchLogo}
                  label="រូបភាពនិមិត្តសញ្ញារបស់សាលា (School Logo Image or Emoji/Icon Base64)"
                  helperText="បញ្ចូលរូបភាពឡូហ្គោសាលាផ្លូវការរបស់អ្នកដើម្បីបង្ហាញលើផ្នែកខាងឆ្វេងបំផុតនៃកំពូលរបារ"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onUpdateSchoolSettings({
                    schoolNameKhmer: schKhmer,
                    schoolNameEnglish: schEnglish,
                    schoolSlogan: schSlogan,
                    schoolLogo: schLogo
                  });
                  onLogAction('UPDATE_SCHOOL_BRANDING', `បានធ្វើបច្ចុប្បន្នភាពស្លាកយីហោសាលារៀន៖ ${schKhmer}`);
                  alert('បានរក្សាទុកព័ត៌មានសាលារៀនជោគជ័យ! School identity saved successfully!');
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[13px] px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all active:scale-98"
              >
                <Save className="w-4 h-4 text-amber-400" />
                រក្សាទុកស្លាកសញ្ញាសាលា (Save School Branding)
              </button>
            </div>
          </div>
        )}

        {/* SYSTEM & SETTINGS TAB */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-[14px] uppercase tracking-wide flex items-center gap-1.5">
                ⚙️ ការកំណត់រចនាបថ និងដាតាបេស (System Preference & Database Suite)
              </h3>
              <p className="text-[13px] text-slate-400 mt-1 font-semibold">
                កំណត់ដង់ស៊ីតេរចនាសម្ព័ន្ធប្លុក (Compact Blocks) ឬធ្វើបដិសេធកម្មទិន្នន័យពីប្រព័ន្ធ
              </p>
            </div>

            {/* Gap-spacing/compact style cards */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[13px] font-black text-slate-800 block">របៀបប្លុកគម្លាតបង្រួមតូចបំផុត (Compact Layout - Dense Padding)</span>
                  <span className="text-[13px] text-slate-500 font-semibold block mt-1 leading-normal">
                    កាត់បន្ថយកម្ពស់ចន្លោះប្រហោង គម្លាតប្លុក និងទំហំព្យួរដើម្បីមើលទិន្នន័យបានពេញអេក្រង់ច្រើនជាងមុន
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompactMode}
                    onChange={(e) => onToggleCompactMode(e.target.checked)}
                    className="sr-only peer cursor-pointer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>

            {/* School Setup & Bulk Demo Data Generator */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg space-y-3.5 mt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100/60 rounded-lg text-emerald-700 shrink-0">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-800 text-[13px] uppercase tracking-wider">📥 នាំចូលទិន្នន័យគំរូសាលា (School Setup & Bulk Demo Importer)</h4>
                  <p className="text-[13px] text-slate-650 font-semibold leading-relaxed mt-1">
                    ដំណើរការបង្កើនបង្កើតថ្នាក់រៀនចំនួន ១០ថ្នាក់ និងចុះឈ្មោះសិស្សគំរូសរុបចំនួន ៥០០នាក់ (៥០នាក់ក្នុងមួយថ្នាក់) ដោយស្វ័យប្រវត្តិក្នុងប្រព័ន្ធ ដើម្បីងាយស្រួលធ្វើតេស្តសាកល្បងប្រព័ន្ធ គ្រប់គ្រងវត្តមាន ពិន្ទុ និងការបង់ប្រាក់។
                  </p>
                </div>
              </div>

              <div className="pt-1 select-none flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const confirmGen = window.confirm("តើអ្នកពិតជាចង់កំណត់ប្រព័ន្ធ និងនាំចូលទិន្នន័យគំរូចំនួន ១០ថ្នាក់ ៥០០សិស្សមែនទេ? (Are you sure you want to initialize 10 classes and 500 students?)");
                    if (confirmGen && onImportSampleSchoolData) {
                      onImportSampleSchoolData();
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-100" />
                  នាំចូលព័ត៌មានគំរូ ១០ថ្នាក់ (សិស្សសរុប ៥០០នាក់)
                </button>
              </div>
            </div>

            {/* DANGER DESTRUCTION ZONE for Super Admins only */}
            {currentUser.role === 'super_admin' ? (
              <div className="border border-red-200 bg-red-50/40 p-4 rounded-lg space-y-3.5 mt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-650 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-650" />
                  </div>
                  <div>
                    <h4 className="font-black text-red-800 text-[13px] uppercase tracking-wider">តំបន់គ្រោះថ្នាក់បំផុត (Danger Zone / Database Purge)</h4>
                    <p className="text-[13px] text-slate-600 font-semibold leading-relaxed mt-1">
                      ការចុចលើប៊ូតុងខាងក្រោមនឹងលុប និងជម្រះរាល់ទិន្នន័យទាំងអស់ពីក្នុងប្រព័ន្ធ (សិស្ស គ្រូ ថ្នាក់រៀន វត្តមាន ពិន្ទុ និងវិក្កយបត្រ) រួចកំណត់ឡើងវិញតាមលំនាំដើមរបស់សាលា។ ទិន្នន័យដែលបានលុបមិនអាចទាញយកមកវិញបានទេ។
                    </p>
                  </div>
                </div>

                <div className="pt-1 select-none flex items-center">
                  <button
                    onClick={() => {
                      const confirm1 = window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យទាំងអស់មែនទេ? (Are you sure to purge all system data?)");
                      if (confirm1) {
                        const confirm2 = window.confirm("បញ្ជាក់៖ ទិន្នន័យទាំងអស់នឹងរលាយបាត់ទាំងស្រុង! ចុច OK ដើម្បីលុប។");
                        if (confirm2) {
                          onClearData();
                        }
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2.5 text-[13px] font-black text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4 text-rose-200 animate-spin-reverse" />
                    សម្អាត និងលុបដេប៉ូទាំងអស់ឡើងវិញ (Purge & Reset All School Records)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-400 italic font-semibold text-[13px] flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-slate-350" />
                <span>ការកំណត់សុវត្ថិភាពកម្រិតខ្ពស់ និងរៀបចំដាតាបេស ត្រូវបានអនុញ្ញាតចំពោះ Super Admin តែប៉ុណ្ណោះ</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
