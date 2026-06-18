"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { getMissionById } from "@/lib/missions";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
  missionId?: string;
  caption?: string;
};

export default function LiveWall({ params }: { params: { slug: string } }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchApprovedPhotos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`);
      setPhotos(res.data);
    } catch (error) {
      console.error("Gagal memuat live wall:", error);
    }
  };

  useEffect(() => {
    fetchApprovedPhotos();
    const interval = setInterval(fetchApprovedPhotos, 5000);
    return () => clearInterval(interval);
  }, [params.slug]);

  // Auto-scroll logic
  useEffect(() => {
    let animationFrameId: number;
    let scrollSpeed = 0.3; // Very slow cinematic scroll

    const autoScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
        
        // Handle loop
        if (scrollRef.current.scrollTop + scrollRef.current.clientHeight >= scrollRef.current.scrollHeight - 1) {
          scrollRef.current.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Delay start of autoscroll by a few seconds
    const timeoutId = setTimeout(() => {
      if (photos.length > 5) { // Only scroll if there are enough photos to scroll
        autoScroll();
      }
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [photos.length]);

  const joinUrl = `http://localhost:3000/${params.slug}`;

  return (
    <div className="bg-on-background text-surface overflow-hidden font-body-md selection:bg-primary/30 h-screen w-full relative">
      {/* Cinematic Background Shader */}
      <div className="fixed inset-0 z-0 bg-[#111]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-black opacity-60"></div>
      </div>

      {/* UI Overlay: Header */}
      <header className="fixed top-0 left-0 w-full z-30 px-margin-mobile md:px-margin-desktop py-8 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <h1 className="font-display-lg text-display-lg tracking-tight text-surface drop-shadow-lg">
            {params.slug.replace(/-/g, ' ').toUpperCase()}
          </h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <p className="font-label-md text-label-md uppercase tracking-[0.2em] text-surface-variant">Live Wedding Stream</p>
          </div>
        </div>
        
        <div className="flex items-center gap-stack-lg pointer-events-auto bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-right hidden md:block">
            <p className="font-headline-md text-headline-md text-surface-bright italic">Share your moments</p>
            <p className="font-label-sm text-label-sm text-surface-variant/80">Scan the code to upload photos</p>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-inner transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-white flex items-center justify-center">
              <QRCode value={joinUrl} size={112} style={{ height: "100%", width: "100%" }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Masonry Photo Wall */}
      <main 
        ref={scrollRef}
        className="relative z-10 w-full h-screen overflow-y-auto pt-48 pb-24 px-margin-mobile md:px-margin-desktop"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
             <div className="text-center animate-pulse">
                <span className="material-symbols-outlined text-6xl text-surface-variant/50 mb-4">photo_camera</span>
                <p className="text-surface-variant font-headline-md text-2xl">Waiting for the first moment...</p>
             </div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {photos.map((photo, i) => {
              const mission = getMissionById(photo.missionId);
              return (
                <div 
                  key={photo.id} 
                  className="break-inside-avoid relative overflow-hidden rounded-2xl bg-surface-container shadow-2xl border border-white/5 group"
                  style={{
                    animation: `slideUpFade 0.8s ease-out forwards`,
                    animationDelay: `${(i % 12) * 0.1}s`,
                    opacity: 0,
                    transform: 'translateY(40px) scale(0.95)'
                  }}
                >
                  <img 
                    src={photo.storageKey} 
                    alt="Captured moment" 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    {photo.caption && (
                      <p className="text-white text-lg font-medium leading-tight mb-2 drop-shadow-md">"{photo.caption}"</p>
                    )}
                    <p className="font-label-sm text-label-sm text-white/80">Shared by {photo.uploaderSessionId}</p>
                    {mission && (
                      <div className="inline-flex mt-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 items-center gap-1">
                        <span className="text-sm">{mission.icon}</span>
                        <span className="text-[10px] font-medium text-white/90">{mission.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer Status */}
      <footer className="fixed bottom-0 left-0 w-full z-30 px-margin-desktop py-6 flex justify-between items-center pointer-events-none bg-gradient-to-t from-[#111]/90 to-transparent">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex -space-x-3">
             <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-surface-variant flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-sm">stars</span>
             </div>
             {photos.length > 0 && (
                <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm">
                    +{photos.length}
                </div>
             )}
          </div>
          <p className="font-label-md text-label-md text-surface-variant">Guests are uploading moments right now</p>
        </div>
        <div className="flex items-center gap-2 text-surface-variant/30 pointer-events-auto">
          <span className="material-symbols-outlined text-[18px]">movie</span>
          <span className="font-label-sm text-label-sm tracking-widest">DIGITAL WEDDING TIME CAPSULE PROJECTOR</span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        main::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
