"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import Webcam from "react-webcam";
import { predefinedMissions, getMissionById } from "@/lib/missions";
import QRCode from "react-qr-code";
import ThemeInjector from "@/components/ThemeInjector";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
  missionId?: string;
  caption?: string;
};

export default function GuestView({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'GALLERY'>('GALLERY');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [eventStatus, setEventStatus] = useState<'LOADING' | 'UPCOMING' | 'LIVE' | 'ENDED' | 'NOT_FOUND'>('LOADING');
  const [eventName, setEventName] = useState<string | null>(null);
  const [hasSignedGuestbook, setHasSignedGuestbook] = useState<boolean>(false);
  
  // Guestbook Form State
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [attendanceCount, setAttendanceCount] = useState("1");
  const [isSubmittingGuestbook, setIsSubmittingGuestbook] = useState(false);

  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isTicketClaimed, setIsTicketClaimed] = useState(false);

  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // Check Guestbook Status
    const savedName = localStorage.getItem(`guest_name_${params.slug}`);
    const savedCaption = localStorage.getItem(`guest_message_${params.slug}`);
    const savedTicketId = localStorage.getItem(`guest_ticket_${params.slug}`);
    const savedClaimStatus = localStorage.getItem(`guest_ticket_claimed_${params.slug}`) === 'true';

    if (savedName) {
      setUploaderName(savedName);
      setGuestName(savedName);
      setCaption(savedCaption || "");
      if (savedTicketId) setTicketId(savedTicketId);
      if (savedClaimStatus) setIsTicketClaimed(true);
      setHasSignedGuestbook(true);
    }

    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${params.slug}`)
      .then(res => {
         setEventStatus(res.data.status || 'LIVE');
         setEventName(res.data.name || params.slug);
      })
      .catch(err => {
         console.error("Gagal memuat status:", err);
         if (err.response && err.response.status === 404) {
           setEventStatus('NOT_FOUND');
         } else {
           setEventStatus('LIVE'); // Fallback if network error
         }
      });

    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/photos/${params.slug}?status=APPROVED`)
      .then(res => setApprovedPhotos(res.data))
      .catch(err => console.error("Gagal memuat galeri:", err));
  }, [params.slug]);

  // Polling for Ticket Claim Status
  useEffect(() => {
    if (ticketId && !isTicketClaimed) {
      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/guestbook/entry/${ticketId}`);
          if (res.data && res.data.souvenirClaimed) {
            setIsTicketClaimed(true);
            localStorage.setItem(`guest_ticket_claimed_${params.slug}`, 'true');
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Gagal polling tiket", error);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [ticketId, isTicketClaimed, params.slug]);

  const submitGuestbook = async () => {
    if (!guestName.trim()) return alert("Please enter your name.");
    setIsSubmittingGuestbook(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/guestbook`, {
        eventSlug: params.slug,
        name: guestName.trim(),
        message: guestMessage.trim(),
        attendanceCount: parseInt(attendanceCount, 10),
      });
      localStorage.setItem(`guest_name_${params.slug}`, guestName.trim());
      localStorage.setItem(`guest_message_${params.slug}`, guestMessage.trim());
      localStorage.setItem(`guest_ticket_${params.slug}`, res.data.id);
      
      setUploaderName(guestName.trim());
      setCaption(guestMessage.trim());
      setTicketId(res.data.id);
      setHasSignedGuestbook(true);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan, silakan coba lagi.");
    } finally {
      setIsSubmittingGuestbook(false);
    }
  };

  const handleCaptureClick = () => {
    setIsCameraOpen(true);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
          setPhoto(file);
          setPreview(imageSrc);
          setIsCameraOpen(false);
        });
    }
  }, [webcamRef]);

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!photo) return;
    setIsUploading(true);

    try {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${params.slug}/${fileName}`;

      const { error } = await supabase.storage.from('photos').upload(filePath, photo);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(filePath);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/photos`, {
        eventSlug: params.slug,
        url: publicUrlData.publicUrl,
        uploaderName: uploaderName.trim() || 'Guest', 
        missionId: activeMission,
        caption: caption.trim() || undefined,
      });

      alert("Photo uploaded! Waiting for moderator approval.");
      
      setPhoto(null);
      setPreview(null);
      setActiveMission(null);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  if (eventStatus === 'LOADING') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <ThemeInjector slug={params.slug} />
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (eventStatus === 'UPCOMING') {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ThemeInjector slug={params.slug} />
        <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-6 text-primary">
           <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-4">Acara Belum Dimulai</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          Portal interaktif untuk {eventName || 'pernikahan ini'} belum dibuka. Silakan kembali lagi nanti saat acara sudah dimulai!
        </p>
      </div>
    );
  }

  if (eventStatus === 'ENDED') {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ThemeInjector slug={params.slug} />
        <div className="w-24 h-24 bg-surface-variant rounded-full flex items-center justify-center mb-6 text-on-surface-variant">
           <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-4">Acara Telah Selesai</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          Terima kasih telah berpartisipasi dalam pernikahan {eventName || 'ini'}! Semua memori telah tersimpan dengan aman dalam kapsul waktu digital.
        </p>
      </div>
    );
  }

  if (eventStatus === 'NOT_FOUND') {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ThemeInjector slug={params.slug} />
        <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mb-6 text-error">
           <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-4">Acara Tidak Ditemukan</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          Kapsul waktu digital untuk pernikahan ini belum dibuat atau tidak tersedia. Silakan periksa kembali tautan yang diberikan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen pb-24">
      <ThemeInjector slug={params.slug} />
      
      {/* TopNavBar */}
      <nav className="bg-surface/70 backdrop-blur-md dark:bg-surface-container/70 border-b border-white/20 dark:border-outline-variant/20 shadow-sm top-0 sticky z-40">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto transition-all duration-300 ease-in-out relative">
          <span className="text-headline-md font-headline-md font-bold text-on-surface tracking-tight z-10">Digital Wedding Time Capsule</span>
          <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
            <span className="text-on-surface font-label-md text-label-md bg-surface-container-high/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-outline-variant/20 shadow-sm pointer-events-auto">
              Guest Portal
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl">
        {/* Welcome Hero Section */}
        <section className="flex flex-col items-center text-center mb-stack-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-stack-sm capitalize">The {eventName || params.slug.replace(/-/g, ' ')} Wedding</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-stack-lg">Welcome to our digital time capsule. We are so happy to have you celebrate with us today. Share your favorite moments and create memories together.</p>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <button 
              onClick={() => {
                if (!hasSignedGuestbook) {
                   alert("Please sign the guestbook first (on the right) to upload photos.");
                   return;
                }
                setShowUploadModal(true);
              }}
              className="bg-primary text-white font-label-md text-label-md py-4 px-10 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-all transform active:scale-95"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
              Upload Photo
            </button>
            <button 
               onClick={() => {
                   document.getElementById('ticket-card')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="bg-white border border-primary text-primary font-label-md text-label-md py-4 px-10 rounded-full flex items-center justify-center gap-2 hover:bg-primary-container/20 transition-all"
            >
              <span className="material-symbols-outlined">qr_code_2</span>
              My QR Ticket
            </button>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Featured Live Feed (Asymmetric Large Section) */}
          <div className="lg:col-span-8 space-y-gutter animate-in slide-in-from-left-8 duration-700 delay-100 order-2 lg:order-1">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">Live Wedding Feed</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {approvedPhotos.length === 0 ? (
                 <div className="col-span-2 md:col-span-3 h-64 bg-surface-container rounded-3xl flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">image</span>
                    <p className="text-on-surface-variant font-label-md">No photos yet. Be the first!</p>
                 </div>
              ) : (
                approvedPhotos.map((p, i) => (
                  <div key={p.id} className={`group relative overflow-hidden rounded-3xl h-64 md:h-80 bg-surface-container transition-all duration-500 shadow-sm cursor-pointer ${i % 2 === 1 ? 'md:mt-8' : ''}`}>
                    <img 
                      src={p.storageKey} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt="Moment" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/70 backdrop-blur-md border border-white/20 m-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-label-sm text-label-sm text-primary truncate">By {p.uploaderSessionId}</p>
                      {p.caption && <p className="font-body-md text-xs truncate mt-1 text-on-surface">{p.caption}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column Widgets */}
          <div className="lg:col-span-4 space-y-gutter animate-in slide-in-from-right-8 duration-700 delay-200 order-1 lg:order-2">
            
            {/* My Ticket Card / Guestbook Form */}
            <div id="ticket-card" className="bg-white rounded-[24px] shadow-sm border border-outline-variant/30 overflow-hidden">
              <div className="p-6 bg-primary-container/20 border-b border-outline-variant/20 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                <h3 className="font-headline-md text-headline-md text-primary">Souvenir Ticket</h3>
              </div>
              
              {!hasSignedGuestbook ? (
                <div className="p-6">
                  <p className="text-on-surface-variant font-body-md mb-4 text-sm">Sign the guestbook to unlock your Souvenir Ticket QR Code and upload photos.</p>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-body-md focus:ring-primary focus:border-primary" 
                    />
                    <select 
                      value={attendanceCount}
                      onChange={(e) => setAttendanceCount(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 font-body-md focus:ring-primary focus:border-primary"
                    >
                      <option value="1">1 Person (Just Me)</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5">5+ People</option>
                    </select>
                    <button 
                      onClick={submitGuestbook}
                      disabled={isSubmittingGuestbook}
                      className="w-full bg-primary text-white py-3 rounded-xl font-label-md hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
                    >
                      {isSubmittingGuestbook ? "Saving..." : "Sign Guestbook & Get Ticket"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center">
                  <div className={`w-48 h-48 bg-white border-8 border-surface-container rounded-2xl flex items-center justify-center p-2 mb-6 ${isTicketClaimed ? 'opacity-50 grayscale' : ''}`}>
                    {ticketId ? (
                       <QRCode value={ticketId} size={160} />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-primary-container relative">
                         <span className="material-symbols-outlined text-primary text-8xl">qr_code_2</span>
                       </div>
                    )}
                  </div>
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Guest Name</span>
                      <span className="font-label-md text-label-md text-on-surface truncate max-w-[120px]">{uploaderName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/20">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Redeemed</span>
                      <span className={`font-label-md text-label-md flex items-center gap-1 ${isTicketClaimed ? 'text-secondary' : 'text-primary'}`}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isTicketClaimed ? "check_circle" : "hourglass_empty"}
                        </span>
                        {isTicketClaimed ? "Claimed" : "Ready"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guest Shoutout Card */}
            {hasSignedGuestbook && (
              <div className="bg-secondary-container/20 rounded-[24px] p-6 border border-secondary-container/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Leave a Note</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">To the Happy Couple</p>
                  </div>
                </div>
                <textarea 
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  className="w-full bg-white border-outline-variant/30 rounded-xl p-3 font-body-md text-sm focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/50" 
                  placeholder="Write something sweet..." 
                  rows={3}
                ></textarea>
                <button 
                  onClick={async () => {
                     // Since we don't have an update endpoint easily, we just save to local storage
                     // and alert them. In a real app we'd PATCH the guestbook entry.
                     localStorage.setItem(`guest_message_${params.slug}`, guestMessage.trim());
                     setCaption(guestMessage.trim());
                     alert("Note saved!");
                  }}
                  className="w-full mt-3 bg-secondary text-white font-label-md text-label-md py-3 rounded-xl hover:bg-secondary/90 transition-all"
                >
                  Save Note
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-headline-md text-2xl text-primary mb-6">Upload Memory</h2>

            {isCameraOpen ? (
              <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 relative aspect-[3/4] bg-black">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: facingMode }}
                    mirrored={facingMode === "user"}
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                    className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 backdrop-blur-sm transition"
                  >
                    <span className="material-symbols-outlined text-sm">cameraswitch</span>
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsCameraOpen(false)}
                    className="flex-1 bg-surface-container text-on-surface py-3 rounded-xl font-label-md hover:bg-surface-container-high transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={capturePhoto}
                    className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-label-md hover:bg-opacity-90 transition shadow-md"
                  >
                    <span className="material-symbols-outlined">camera</span>
                    Capture
                  </button>
                </div>
              </div>
            ) : preview ? (
              <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 relative aspect-[3/4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setPhoto(null); setPreview(null); }}
                    className="flex-1 bg-surface-container text-on-surface py-3 rounded-xl font-label-md hover:bg-surface-container-high transition"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-label-md hover:bg-opacity-90 transition shadow-md disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">cloud_upload</span>
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeMission && (
                  <div className="bg-secondary-container/30 border border-secondary/20 text-secondary p-3 rounded-xl flex items-center justify-between">
                    <span className="font-medium text-sm">
                      🎯 Mission: {predefinedMissions.find(m => m.id === activeMission)?.text}
                    </span>
                    <button onClick={() => setActiveMission(null)} className="text-secondary/60 hover:text-secondary">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <button 
                  onClick={handleCaptureClick}
                  className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl font-label-md hover:bg-opacity-90 transition shadow-md group"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">photo_camera</span>
                  Take a Photo
                </button>
                
                <button 
                  onClick={handleGalleryClick}
                  className="w-full flex items-center justify-center gap-3 bg-surface-container-high text-on-surface py-4 px-6 rounded-2xl font-label-md hover:bg-outline-variant/30 transition shadow-sm group"
                >
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:scale-110 transition-transform">image</span>
                  Choose from Gallery
                </button>

                {!activeMission && (
                  <div className="mt-4 border-t border-outline-variant/30 pt-4">
                    <h3 className="font-headline-md text-lg text-on-surface mb-3">📸 Photo Challenges</h3>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                      {predefinedMissions.map(mission => (
                        <button
                          key={mission.id}
                          onClick={() => setActiveMission(mission.id)}
                          className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/50 hover:border-primary hover:bg-primary/5 transition text-left"
                        >
                          <span className="text-2xl">{mission.icon}</span>
                          <span className="font-body-md text-sm text-on-surface font-medium">{mission.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
