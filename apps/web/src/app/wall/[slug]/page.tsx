"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Heart } from "lucide-react";
import { getMissionById } from "@/lib/missions";
import ThemeInjector from "@/components/ThemeInjector";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
  missionId?: string;
  caption?: string;
};

export default function LiveWall({ params }: { params: { slug: string } }) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const fetchApprovedPhotos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`);
      // Update state if there are new photos
      setPhotos(res.data);
    } catch (error) {
      console.error("Gagal memuat live wall:", error);
    }
  };

  useEffect(() => {
    fetchApprovedPhotos();
    // Auto-refresh setiap 5 detik untuk Live Wall
    const interval = setInterval(fetchApprovedPhotos, 5000);
    return () => clearInterval(interval);
  }, [params.slug]);

  return (
    <div className="min-h-screen bg-[#111] overflow-hidden flex flex-col">
      <ThemeInjector slug={params.slug} />
      {/* Header Live Wall */}
      <div className="absolute top-0 left-0 w-full p-8 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="font-heading text-4xl text-champagne drop-shadow-lg">
          {params.slug.replace(/-/g, ' ').toUpperCase()}
        </h1>
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-champagne/30">
          <Heart className="text-rose animate-pulse" fill="currentColor" />
          <span className="text-cream font-body font-medium">Kirim fotomu ke bit.ly/web-link</span>
        </div>
      </div>

      {/* Masonry / Grid Display */}
      <div className="flex-1 p-8 pt-32 overflow-y-auto">
        {photos.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-gray-500 font-body text-2xl animate-pulse">Menunggu momen pertama diunggah...</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {photos.map((photo, i) => {
              const mission = getMissionById(photo.missionId);
              return (
              <div 
                key={photo.id} 
                className="break-inside-avoid relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 group transform transition-all duration-700 hover:scale-105 hover:z-50 hover:border-champagne"
                style={{
                  animation: `fadeInUp 0.8s ease-out forwards`,
                  animationDelay: `${(i % 10) * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={photo.storageKey} 
                  alt="Momen" 
                  className="w-full object-cover rounded-xl"
                  loading="lazy"
                />
                
                {mission && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                    <span className="text-xl">{mission.icon}</span>
                    <span className="text-xs font-medium text-white/90">{mission.text}</span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.caption && (
                    <p className="text-white text-lg font-medium leading-tight mb-2 drop-shadow-md">"{photo.caption}"</p>
                  )}
                  <div className="inline-flex items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <p className="text-white/90 font-body text-xs font-medium tracking-wide">📸 {photo.uploaderSessionId}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </div>
  );
}
