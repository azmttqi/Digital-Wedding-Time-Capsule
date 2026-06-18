"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getMissionById } from "@/lib/missions";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
  status: string;
  createdAt: string;
  missionId?: string;
  caption?: string;
};

export default function ModeratorDashboard({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const router = useRouter();

  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
  const [rejectedPhotos, setRejectedPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:3001/events/${params.slug}/verify`, {
        role: "mod",
        pin: pinInput
      });
      if (res.data.success) {
        setIsLocked(false);
      }
    } catch (err) {
      setPinError("PIN salah. Coba lagi.");
      setPinInput("");
    }
  };

  const fetchPhotos = async () => {
    if (isLocked) return;
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axios.get(`http://localhost:3001/photos/${params.slug}?status=PENDING`),
        axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`),
        axios.get(`http://localhost:3001/photos/${params.slug}?status=REJECTED`),
      ]);
      setPendingPhotos(pendingRes.data);
      setApprovedPhotos(approvedRes.data);
      setRejectedPhotos(rejectedRes.data);
      
      // Auto-select first pending photo if none selected
      if (!selectedPhoto && pendingRes.data.length > 0) {
        setSelectedPhoto(pendingRes.data[0]);
      } else if (pendingRes.data.length === 0) {
        setSelectedPhoto(null);
      } else if (selectedPhoto && !pendingRes.data.find((p: Photo) => p.id === selectedPhoto.id)) {
        // If selected photo is no longer pending, select the next one
        setSelectedPhoto(pendingRes.data[0]);
      }
    } catch (error) {
      console.error("Gagal mengambil foto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      setIsLoading(true);
      fetchPhotos();
      const interval = setInterval(fetchPhotos, 5000);
      return () => clearInterval(interval);
    }
  }, [params.slug, isLocked]);

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedPhoto) return;
    
    // Optimistic UI Update
    const currentPhotoId = selectedPhoto.id;
    const currentPhoto = pendingPhotos.find(p => p.id === currentPhotoId);
    
    setPendingPhotos(prev => prev.filter(p => p.id !== currentPhotoId));
    if (status === 'APPROVED' && currentPhoto) setApprovedPhotos(prev => [currentPhoto, ...prev]);
    if (status === 'REJECTED' && currentPhoto) setRejectedPhotos(prev => [currentPhoto, ...prev]);
    
    const remainingPending = pendingPhotos.filter(p => p.id !== currentPhotoId);
    if (remainingPending.length > 0) {
      setSelectedPhoto(remainingPending[0]);
    } else {
      setSelectedPhoto(null);
    }

    try {
      await axios.patch(`http://localhost:3001/photos/${currentPhotoId}/status`, { status });
    } catch (error) {
      console.error("Gagal mengupdate status:", error);
      fetchPhotos(); // Revert on failure
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <div className="max-w-sm w-full bg-surface-container-lowest rounded-[24px] shadow-xl overflow-hidden p-8 border border-outline-variant/30">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Moderator Access</h1>
          <p className="text-on-surface-variant font-label-md mb-8">Enter your PIN to manage the digital wedding time capsule.</p>
          
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN..."
              className="w-full text-center text-xl p-4 bg-surface-container-high rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              autoFocus
            />
            {pinError && <p className="text-error text-label-sm font-label-sm">{pinError}</p>}
            <button 
              type="submit"
              className="w-full bg-primary text-on-primary py-4 px-6 rounded-2xl font-label-md hover:bg-primary/90 transition shadow-md mt-2"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center font-body-md text-primary animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Main Content Area */}
      <main className="min-h-screen px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto flex flex-col">
        {/* Header */}
        <header className="mb-stack-xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Moderator Dashboard</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Review and approve photos before they appear on the Live Wall.</p>
          </div>
          <button onClick={() => router.push(`/lobby/${params.slug}`)} className="p-3 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition flex items-center gap-2 font-label-md">
            <span className="material-symbols-outlined">arrow_back</span>
            Dashboard
          </button>
        </header>

        {/* Stats Row */}
        <section className="grid grid-cols-3 gap-gutter mb-stack-xl">
          <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_empty</span>
            </div>
            <p className="text-display-lg font-display-lg text-primary">{pendingPhotos.length}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Queue</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-secondary/50 transition-colors">
            <div className="w-10 h-10 bg-secondary-container text-secondary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <p className="text-display-lg font-display-lg text-secondary">{approvedPhotos.length}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Approved</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-error/50 transition-colors">
            <div className="w-10 h-10 bg-error-container text-error rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </div>
            <p className="text-display-lg font-display-lg text-error">{rejectedPhotos.length}</p>
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Rejected</p>
          </div>
        </section>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter flex-1 min-h-[500px]">
          
          {/* Left: Feed of Pending Photos */}
          <section className="lg:col-span-5 xl:col-span-4 flex flex-col bg-surface-container-lowest rounded-[24px] border border-outline-variant/20 shadow-sm overflow-hidden h-[500px] lg:h-auto">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface/50 backdrop-blur-sm z-10 sticky top-0">
              <h3 className="text-headline-sm font-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_library</span>
                Pending Queue
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {pendingPhotos.length === 0 && (
                  <div className="col-span-2 text-center py-12 px-4 opacity-50">
                    <span className="material-symbols-outlined text-4xl mb-2">task_alt</span>
                    <p className="font-label-md">All clear!</p>
                  </div>
                )}
                {pendingPhotos.map((photo) => {
                  const isSelected = selectedPhoto?.id === photo.id;
                  return (
                    <div 
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest' : 'hover:ring-2 hover:ring-primary/50'}`}
                    >
                      <img 
                        src={photo.storageKey} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt="Pending"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-[10px] font-label-sm truncate">User: {photo.uploaderSessionId}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right: Preview and Actions */}
          <section className="lg:col-span-7 xl:col-span-8 bg-surface-container-lowest rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col p-6 relative overflow-hidden min-h-[500px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            {selectedPhoto ? (
              <div className="w-full h-full flex flex-col z-10 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex-1 relative w-full rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center mb-6 shadow-inner">
                  <img 
                    src={selectedPhoto.storageKey} 
                    className="w-full h-full object-contain" 
                    alt="Preview"
                  />
                  <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur-md border border-outline-variant/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                    <span className="text-[11px] font-label-sm text-on-surface truncate max-w-[150px]">{selectedPhoto.uploaderSessionId}</span>
                  </div>
                </div>

                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-6 flex-shrink-0">
                  <div className="flex flex-col text-center xl:text-left w-full xl:w-auto flex-1">
                    <span className="text-[10px] font-label-sm text-primary uppercase tracking-widest mb-1 font-bold">Pending Review</span>
                    <h4 className="text-body-lg font-body-lg text-on-surface line-clamp-2">
                      {selectedPhoto.caption ? `"${selectedPhoto.caption}"` : "No caption provided"}
                    </h4>
                    {selectedPhoto.missionId && (
                       <p className="text-label-sm font-label-sm text-on-surface-variant mt-2 flex items-center gap-1 justify-center xl:justify-start bg-surface-container-high w-max px-3 py-1 rounded-full border border-outline-variant/20">
                         <span className="material-symbols-outlined text-[14px] text-tertiary">stars</span> 
                         {getMissionById(selectedPhoto.missionId)?.text}
                       </p>
                    )}
                  </div>
                  <div className="flex gap-3 w-full xl:w-auto justify-center flex-shrink-0">
                    <button 
                      onClick={() => handleUpdateStatus('REJECTED')}
                      className="group h-12 px-6 rounded-full border border-error/30 text-error hover:bg-error-container hover:border-error transition-all flex items-center gap-2 active:scale-95"
                    >
                      <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-sm">close</span>
                      <span className="text-label-md font-label-md uppercase">Reject</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('APPROVED')}
                      className="group h-12 px-8 rounded-full bg-primary text-on-primary shadow-md hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-label-md font-label-md uppercase">Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500 z-10">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 shadow-inner border border-outline-variant/10">
                  <span className="material-symbols-outlined text-3xl text-primary/60">task_alt</span>
                </div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface">Queue Cleared</h3>
                <p className="text-body-md text-on-surface-variant mt-2 max-w-sm">All submissions have been reviewed. Waiting for new photos from guests...</p>
              </div>
            )}
          </section>
        </div>

        {/* System Status Bar */}
        <footer className="mt-stack-xl flex flex-col md:flex-row items-center justify-between py-6 border-t border-outline-variant/20 gap-4 mt-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-label-sm text-on-surface-variant">Moderator Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-label-sm font-semibold text-primary">
            <span className="text-outline font-normal">© 2026 Digital Wedding Time Capsule Pro</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
