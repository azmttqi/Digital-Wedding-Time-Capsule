"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Lock, Save, Palette, KeyRound, ShieldAlert } from "lucide-react";
import ThemeInjector from "@/components/ThemeInjector";

const THEMES = [
  { id: "rose", name: "Rose (Merah Muda)", color: "bg-[#f43f5e]" },
  { id: "sage", name: "Sage (Hijau Lembut)", color: "bg-[#7E9A82]" },
  { id: "ocean", name: "Ocean (Biru Laut)", color: "bg-[#0ea5e9]" },
  { id: "lavender", name: "Lavender (Ungu)", color: "bg-[#a855f7]" },
  { id: "gold", name: "Gold (Emas)", color: "bg-[#eab308]" },
  { id: "monochrome", name: "Monochrome (Hitam)", color: "bg-[#1f2937]" },
];

export default function AdminDashboard({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    theme: "rose",
    moderatorPin: "1234",
    couplePassword: "password"
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:3001/events/${params.slug}/verify`, {
        role: "admin",
        pin: pinInput
      });
      if (res.data.success) {
        setIsLocked(false);
        fetchSettings();
      }
    } catch (err) {
      setPinError("Password salah!");
      setPinInput("");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/events/${params.slug}`);
      setFormData(prev => ({ ...prev, theme: res.data.theme || "rose" }));
    } catch(err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.patch(`http://localhost:3001/events/${params.slug}/settings`, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Force theme update across tabs if using localStorage/cookies, 
      // but for now a simple reload or letting them know it's saved is fine.
    } catch(err) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <ThemeInjector slug={params.slug} />
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-champagne/50">
          <div className="flex justify-center mb-4 text-gray-800">
            <Lock size={48} />
          </div>
          <h1 className="font-heading text-3xl text-gray-800 mb-2">Admin Setup</h1>
          <p className="text-gray-500 mb-8 font-body text-sm">Masukkan Couple Password Anda.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Password..."
              className="w-full text-center text-xl p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-800"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm font-body">{pinError}</p>}
            <button 
              type="submit"
              className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-medium hover:bg-gray-800 transition shadow-md mt-2"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body p-4 sm:p-8">
      <ThemeInjector slug={params.slug} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
            <Lock className="text-gray-900" size={28} />
            <h1 className="font-heading text-3xl text-gray-900">Pengaturan Acara</h1>
          </div>

          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-center font-medium">
              Pengaturan berhasil disimpan!
            </div>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-8">
            
            {/* Keamanan */}
            <section>
              <h2 className="text-xl font-heading text-gray-800 mb-4 flex items-center gap-2">
                <KeyRound size={20} className="text-amber-500"/> Keamanan Akses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Couple Password</label>
                  <p className="text-xs text-gray-500 mb-2">Untuk akses Admin & Hub Pengantin.</p>
                  <input 
                    type="text" 
                    value={formData.couplePassword}
                    onChange={e => setFormData({...formData, couplePassword: e.target.value})}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Moderator PIN</label>
                  <p className="text-xs text-gray-500 mb-2">Angka rahasia (disarankan 4 digit) untuk panitia.</p>
                  <input 
                    type="text" 
                    value={formData.moderatorPin}
                    onChange={e => setFormData({...formData, moderatorPin: e.target.value})}
                    className="w-full p-3 border rounded-xl font-mono text-center tracking-widest"
                  />
                </div>
              </div>
            </section>

            {/* Tema */}
            <section>
              <h2 className="text-xl font-heading text-gray-800 mb-4 flex items-center gap-2">
                <Palette size={20} className="text-indigo-500"/> Tema Warna Aplikasi
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map(theme => (
                  <label 
                    key={theme.id}
                    className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition ${
                      formData.theme === theme.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="theme" 
                      value={theme.id}
                      checked={formData.theme === theme.id}
                      onChange={() => setFormData({...formData, theme: theme.id})}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 rounded-full ${theme.color} shadow-inner`}></div>
                    <span className="text-xs font-medium text-center text-gray-700">{theme.name}</span>
                  </label>
                ))}
              </div>
            </section>

            <button 
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
