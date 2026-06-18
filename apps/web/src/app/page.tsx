"use client";

import { useState, useEffect } from "react";
import { Camera, ShieldCheck, MonitorPlay, Heart, Scan, Settings, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [slug, setSlug] = useState("");
  const [eventsList, setEventsList] = useState<{slug: string, coupleName: string}[]>([]);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3001/events");
      setEventsList(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleNavigation = (pathPrefix: string) => {
    if (!slug) return alert("Silakan masukkan nama acara terlebih dahulu.");
    const formattedSlug = slug.toLowerCase().replace(/\s+/g, '-');
    router.push(`${pathPrefix}${formattedSlug}`);
  };

  const handleCreateEvent = async () => {
    const rawSlug = prompt("Masukkan Nama URL Acara (contoh: budi-ani):");
    if (!rawSlug) return;
    const formattedSlug = rawSlug.toLowerCase().replace(/\s+/g, '-');
    
    try {
      // Check if exists
      await axios.get(`http://localhost:3001/events/${formattedSlug}`);
      alert("Acara dengan URL ini sudah ada! Anda bisa langsung masuk.");
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Create new
        const coupleName = prompt("Acara belum ada. Masukkan Nama Pasangan untuk membuat acara ini:");
        if (!coupleName) return;
        try {
          await axios.post(`http://localhost:3001/events`, {
            slug: formattedSlug,
            coupleName: coupleName
          });
          alert("Acara berhasil dibuat! Silakan masuk ke Pengaturan untuk mengatur sandi & warna.");
          await fetchEvents();
          setSlug(formattedSlug);
          router.push(`/admin/${formattedSlug}`);
        } catch(createErr) {
          alert("Gagal membuat acara.");
        }
      } else {
        alert("Gagal mengecek acara.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-cream font-body pb-20">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-champagne/50">
        <h1 className="font-heading text-4xl text-rose mb-2">
          Time Capsule
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Pilih portal masuk sesuai dengan peran Anda di acara ini.
        </p>
        
        <div className="mb-8 text-left">
          <label className="block text-gray-700 text-sm font-medium mb-2">Pilih Acara</label>
          <div className="flex gap-2 w-full">
            <select 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 min-w-0 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose transition cursor-pointer"
            >
              <option value="" disabled>-- Pilih Acara --</option>
              {eventsList.length === 0 && <option value="" disabled>Memuat...</option>}
              {eventsList.map(e => (
                <option key={e.slug} value={e.slug}>
                  {e.coupleName} ({e.slug})
                </option>
              ))}
            </select>
            <button 
              onClick={handleCreateEvent}
              className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition shadow flex items-center justify-center gap-1 text-sm font-medium px-4"
            >
              <Plus size={16}/> Baru
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => handleNavigation('/')}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-sage/10 text-sage rounded-2xl hover:bg-sage/20 transition border border-sage/20"
          >
            <Camera size={32} />
            <span className="font-medium text-sm">Tamu Undangan</span>
          </button>
          
          <button 
            onClick={() => handleNavigation('/mod/')}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-100 transition border border-amber-200"
          >
            <ShieldCheck size={32} />
            <span className="font-medium text-sm">Moderator</span>
          </button>

          <button 
            onClick={() => handleNavigation('/souvenir/')}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition border border-indigo-200"
          >
            <Scan size={32} />
            <span className="font-medium text-sm">Souvenir</span>
          </button>

          <button 
            onClick={() => handleNavigation('/wall/')}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition border border-slate-200"
          >
            <MonitorPlay size={32} />
            <span className="font-medium text-sm">Proyektor</span>
          </button>

          <button 
            onClick={() => handleNavigation('/hub/')}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-rose/10 text-rose rounded-2xl hover:bg-rose/20 transition border border-rose/20"
          >
            <Heart size={32} />
            <span className="font-medium text-sm">Pengantin</span>
          </button>

          <button 
            onClick={() => handleNavigation('/admin/')}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 text-gray-800 rounded-2xl hover:bg-gray-200 transition border border-gray-300"
          >
            <Settings size={32} />
            <span className="font-medium text-sm">Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
