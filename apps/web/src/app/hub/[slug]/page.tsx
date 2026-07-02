"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Download, Archive } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
};

type GuestbookEntry = {
  id: string;
  name: string;
  message: string | null;
  attendanceCount: number;
  createdAt: string;
};

export default function BrideGroomHub({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [eventError, setEventError] = useState(false);

  const [thankYouMessage, setThankYouMessage] = useState("To our dearest family and friends, thank you for making our day so magical. These memories wouldn't be the same without you.");

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${params.slug}`)
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setEventError(true);
        }
      });
  }, [params.slug]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${params.slug}/verify`, {
        role: "hub",
        pin: pinInput
      });
      if (res.data.success) {
        setIsLocked(false);
      }
    } catch (err) {
      setPinError("Invalid PIN.");
      setPinInput("");
    }
  };

  useEffect(() => {
    if (!isLocked) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/photos/${params.slug}?status=APPROVED`)
        .then(res => setPhotos(res.data))
        .catch(err => console.error("Gagal memuat foto:", err));
        
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/guestbook/${params.slug}`)
        .then(res => setGuestbookEntries(res.data))
        .catch(err => console.error("Gagal memuat buku tamu:", err));
    }
  }, [isLocked, params.slug]);

  const totalGuests = guestbookEntries.reduce((sum, entry) => sum + entry.attendanceCount, 0);

  const handleDownloadCSV = () => {
    if (guestbookEntries.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Waktu,Nama Tamu,Jumlah Hadir,Pesan/Doa\n";
    
    guestbookEntries.forEach(entry => {
      const date = new Date(entry.createdAt).toLocaleString('id-ID');
      const name = `"${entry.name.replace(/"/g, '""')}"`;
      const message = `"${(entry.message || '').replace(/"/g, '""')}"`;
      csvContent += `${date},${name},${entry.attendanceCount},${message}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    saveAs(encodedUri, `buku_tamu_${params.slug}.csv`);
  };

  const handleDownloadZip = async () => {
    if (photos.length === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      
      let count = 0;
      for (const photo of photos) {
        const response = await fetch(photo.storageKey);
        const blob = await response.blob();
        
        const fileExt = photo.storageKey.split('.').pop() || 'jpg';
        const fileName = `photo_${count + 1}.${fileExt}`;
        
        zip.file(fileName, blob);
        
        count++;
        setDownloadProgress(Math.round((count / photos.length) * 100));
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `wedding_photos_${params.slug}.zip`);
      
    } catch (error) {
      console.error("Gagal membuat ZIP:", error);
      alert("Terjadi kesalahan saat mengunduh foto.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (eventError) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mb-6 text-error">
           <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-4">Acara Tidak Ditemukan</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          B&G Hub untuk acara ini tidak ditemukan. Silakan periksa kembali tautan Anda.
        </p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <div className="max-w-sm w-full bg-surface-container-lowest rounded-[24px] shadow-xl overflow-hidden p-8 border border-outline-variant/30">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">favorite</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">B&G Hub Access</h1>
          <p className="text-on-surface-variant font-label-md mb-8">Enter your secure PIN to access memories.</p>
          
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
              Unlock Hub
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen pb-24">
      {/* Main Content Area */}
      <main className="min-h-screen px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto">
        {/* Header */}
        <header className="mb-stack-xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">B&amp;G Hub</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Private dashboard to view attendance, download ZIP/CSV, and explore your digital wedding time capsule.</p>
          </div>
          <button onClick={() => router.push(`/lobby/${params.slug}`)} className="p-3 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition flex items-center gap-2 font-label-md">
            <span className="material-symbols-outlined">arrow_back</span>
            Dashboard
          </button>
        </header>
        {/* Hero Section */}
        <section className="mb-stack-xl relative overflow-hidden rounded-[32px] min-h-[400px] flex items-center p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')" }}
            >
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-2xl text-white">
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-4 text-white">The First Chapter.</h1>
            <p className="font-body-lg text-body-lg mb-8 opacity-90 text-white">Every laugh, every tear, and every toast—captured forever in your digital vault. Welcome home, {params.slug.replace(/-/g, ' ')}.</p>
            <button 
              onClick={handleDownloadZip}
              disabled={isDownloading || photos.length === 0}
              className="bg-white text-primary px-8 py-4 rounded-full font-label-md text-label-md flex items-center gap-3 hover:bg-surface-bright transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? (
                 <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>progress_activity</span>
              ) : (
                 <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
              )}
              {isDownloading ? `Processing (${downloadProgress}%)` : `Download All Photos (.ZIP)`}
            </button>
          </div>
        </section>

        {/* Bento Stats & Customizer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-stack-xl">
          {/* Guest Summary */}
          <div className="md:col-span-4 bg-white/70 backdrop-blur-md p-8 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/20 flex flex-col justify-between animate-in slide-in-from-bottom-10 duration-700">
            <div>
              <span className="text-label-sm font-label-sm text-primary uppercase mb-4 block">Attendance Summary</span>
              <h2 className="font-headline-md text-headline-md mb-8 text-on-surface">{totalGuests} Loved Ones</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">group</span>
                  <span className="font-label-md text-label-md">Total Groups/RSVP</span>
                </div>
                <span className="font-bold">{guestbookEntries.length}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="font-label-md text-label-md">Attended (Heads)</span>
                </div>
                <span className="font-bold">{totalGuests}</span>
              </div>
            </div>
            <button 
              onClick={handleDownloadCSV}
              disabled={guestbookEntries.length === 0}
              className="mt-8 text-primary font-label-md text-label-md flex items-center gap-2 hover:translate-x-1 transition-transform disabled:opacity-50"
            >
              Download Guestbook (.CSV) <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>

          {/* Message Customizer */}
          <div className="md:col-span-8 bg-surface-container-high/50 p-8 rounded-[24px] border border-outline-variant/30 flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-100">
            <div className="flex-1">
              <span className="text-label-sm font-label-sm text-primary uppercase mb-4 block">Personal Touch</span>
              <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">Thank You Message</h2>
              <p className="text-on-surface-variant mb-6 font-body-md">Customize the message your guests see when they visit the gallery or receive their digital favors. (Preview Only)</p>
              <textarea 
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-xl p-4 min-h-[120px] focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md" 
                placeholder="Write something heartfelt..."
              />
              <div className="mt-6 flex gap-4">
                <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md text-label-md hover:opacity-90">Save Message</button>
              </div>
            </div>
            <div className="hidden md:block w-48 shrink-0">
              <div className="aspect-[3/4] bg-primary-container/30 rounded-[20px] p-4 flex flex-col justify-end relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div 
                    className="w-full h-full bg-cover" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop')" }}
                  ></div>
                </div>
                <div className="relative z-10 text-primary">
                  <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <p className="font-headline-md text-sm italic line-clamp-3">"{thankYouMessage || "Magical memories..."}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <section className="mt-stack-xl animate-in slide-in-from-bottom-10 duration-700 delay-200">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="font-display-lg text-headline-lg mb-2">Memory Gallery</h2>
              <p className="text-on-surface-variant font-body-md">Browse through the approved collection of {photos.length} moments shared by your guests.</p>
            </div>
          </div>

          {/* Asymmetric Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter auto-rows-min">
            {photos.map((photo, i) => {
               // Make the first image a featured large image
               const isFeatured = i === 0;
               return (
                  <div 
                    key={photo.id}
                    className={`group relative overflow-hidden rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] cursor-pointer bg-surface-container ${isFeatured ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square'}`}
                  >
                    <img 
                      src={photo.storageKey} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="Moment"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-white font-label-md text-label-md">Captured by {photo.uploaderSessionId}</p>
                    </div>
                  </div>
               )
            })}
            {photos.length === 0 && (
                <div className="col-span-2 md:col-span-4 aspect-video bg-surface-container flex flex-col items-center justify-center rounded-[24px]">
                    <span className="material-symbols-outlined text-4xl text-outline mb-4">photo_library</span>
                    <p className="text-on-surface-variant font-headline-md">No memories approved yet.</p>
                </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
