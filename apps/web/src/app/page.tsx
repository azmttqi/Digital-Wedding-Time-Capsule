"use client";

import { useState } from "react";
import { Camera, ShieldCheck, MonitorPlay, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [slug, setSlug] = useState("azmttqi-wedding");
  const router = useRouter();

  const handleNavigation = (pathPrefix: string) => {
    if (!slug) return alert("Silakan masukkan nama acara terlebih dahulu.");
    // Convert to URL-friendly slug: lowercase, replace spaces with hyphens
    const formattedSlug = slug.toLowerCase().replace(/\s+/g, '-');
    router.push(`${pathPrefix}${formattedSlug}`);
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
          <label className="block text-gray-700 text-sm font-medium mb-2">Nama Acara</label>
          <input 
            type="text" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="contoh: Pernikahan Budi"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
}
